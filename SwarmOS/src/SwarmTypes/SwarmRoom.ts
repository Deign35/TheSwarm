import { profile } from "Tools/Profiler";
import { SwarmTypeBase } from "SwarmTypes/SwarmTypes";
import { SwarmSpawn } from "SwarmTypes/SwarmStructures/SwarmSpawn";
import { SwarmLoader } from "SwarmTypes/SwarmLoader";
import { ConsulObject, SwarmConsul } from "Consuls/ConsulBase";
import { MemoryObject } from "SwarmMemory/SwarmMemory";
import { NotImplementedException } from "Tools/SwarmExceptions";
import { HarvestConsul } from "Consuls/HarvestConsul";
import { ControlConsul } from "Consuls/ControlConsul";
import { SwarmController } from "SwarmTypes/SwarmStructures/SwarmController";

export type SwarmRoom = SwarmRoom_Base<RoomType>;
const FLASH_SPAWN = 'spawns';
const FLASH_REFRESH_TICK = 'refreshTick';

@profile
export class SwarmRoom_Base<T extends RoomType> extends SwarmTypeBase<IData, Room> implements AIRoom, Room {
    RefreshObject(): void {
        
    }
    FinalizeObject(): void {
        throw new Error("Method not implemented.");
    }
    AssignCreep(name: string): boolean {
        throw new Error("Method not implemented.");
    }
    private _adjustedTime = 0;
    protected get adjustedTime() {
        if (this._adjustedTime == 0) {
            this._adjustedTime = Game.time + this.memory.GetData<number>('Adj');
        }
        return this._adjustedTime;
    }
    protected get refreshTick() {
        if (!this.memory.HasData(FLASH_REFRESH_TICK)) {
            this.memory.SetData(FLASH_REFRESH_TICK, -1, false);
        }

        return this.memory.GetData(FLASH_REFRESH_TICK);
    }
    protected get spawns(): string[] {
        if (!this.memory.HasData(FLASH_SPAWN) && this.refreshTick != Game.time) {
            let availableSpawns = [];
            for (let i = 0, ids = SwarmLoader.SwarmRoomIDs[this.name].structures[STRUCTURE_SPAWN]; i < (ids && ids.length); i++) {
                let spawn = SwarmLoader.GetObject<SwarmSpawn>(ids[i], MASTER_STRUCTURE_MEMORY_ID);
                //if (!spawn.spawning) {
                availableSpawns.push(ids[i]);
                //}
            }
            this.memory.SetData(FLASH_SPAWN, availableSpawns, false);
            this.memory.SetData(FLASH_REFRESH_TICK, Game.time, false);
        }
        return this.memory.GetData(FLASH_SPAWN);
    }

    PrepObject() {
        this.TryFindNewObjects();
    }

    TrySpawn(body: BodyPartConstant[], opts: {
        memory?: TCreepData,
        energyStructures?: Array<(StructureSpawn | StructureExtension)>,
        directions?: DirectionConstant[],
        spawnID?: string,
        priority: Priority,
        requestorType: string,
        requestorID: string
    }, name?: string) {
        if (GetSpawnCost(body) > this.energyAvailable) {
            return;
        }

        let spawn: SwarmSpawn | undefined;
        if (opts && opts.spawnID) {
            spawn = SwarmLoader.GetObject<SwarmSpawn>(opts.spawnID, MASTER_STRUCTURE_MEMORY_ID);
        } else if (this.spawns.length > 0) {
            if (this.spawns.length > 1) {

            } else {
                let spawn = SwarmLoader.GetObject<SwarmSpawn>(this.spawns[0], MASTER_STRUCTURE_MEMORY_ID);
                spawn.memory.ReserveMemory();
                spawn.spawnCreep(body, name, opts);
                spawn.memory.ReleaseMemory();
            }
        }
    }

    InitAsNew() {
        SwarmLogger.Log("Initializing a new room");
        this.memory.SetData('Adj', GetSUID(), true);
        let roomType = this.controller && this.controller.owner &&
            this.controller.owner.username == MY_USERNAME &&
            this.controller.level;// RCL1 - RCL8 if I own the room

        if (!roomType) {
            roomType = RoomType.NeutralRoom;
            // Not mine, what is it?
            if (this.controller) {
                roomType = RoomType.NonHostile;
                if (this.controller.owner) {
                    roomType = RoomType.Hostile;
                } else if (this.controller.reservation) {
                    if (this.controller.reservation.username == MY_USERNAME) {
                        roomType = RoomType.HarvestSupport;
                        //SwarmLoader.LoadObject(this.controller.id, this.controller, MASTER_STRUCTURE_MEMORY_ID);
                        let controlConsul = SwarmLoader.GetObject<ControlConsul>("Control", MASTER_CONSUL_MEMORY_ID);
                        controlConsul.memory.ReserveMemory();
                        controlConsul.AddControllerID(this.controller!.id);
                        SwarmLoader.SaveObject(controlConsul);
                    } else {
                        roomType = RoomType.Hostile;
                    }
                }
            } else {
                roomType = RoomType.NeutralRoom;
                let hasKeeperLair = this.find(FIND_STRUCTURES, {
                    filter: function (struct) {
                        return struct.structureType == STRUCTURE_KEEPER_LAIR;
                    }
                }).length > 0;

                if (hasKeeperLair) {
                    roomType = RoomType.KeepersLair;
                }
            }
        } else {
            let controlConsul = SwarmLoader.GetObject<ControlConsul>("Control", MASTER_CONSUL_MEMORY_ID);
            controlConsul.memory.ReserveMemory();
            controlConsul.AddControllerID(this.controller!.id);
            SwarmLoader.SaveObject(controlConsul);
        }
        // (TODO): Convert SetData here to convert the entire object within the swarm.
        this.memory.SetData(SUB_TYPE, roomType, true)

        // (TODO): Add pathfinding.

        let sourceIDs = [];
        let sources = this.find(FIND_SOURCES);
        for (let i = 0; i < sources.length; i++) {
            sourceIDs.push(sources[i].id);
            SwarmLoader.LoadObject(sources[i].id, sources[i], MASTER_ROOMOBJECT_MEMORY_ID);
        }

        let minerals = this.find(FIND_MINERALS);
        for (let i = 0; i < minerals.length; i++) {
            SwarmLoader.LoadObject(minerals[i].id, minerals[i], MASTER_ROOMOBJECT_MEMORY_ID);
        }
        // (TODO): Instead of TryFindNewObjects, use a single LookAtArea and find all objects for the new room.
        this.TryFindNewObjects(true);
        let harvestConsul = SwarmLoader.GetObject<HarvestConsul>("Harvest", MASTER_CONSUL_MEMORY_ID);
        harvestConsul.memory.ReserveMemory();
        harvestConsul.AddSourceIDs(sourceIDs);
        SwarmLoader.SaveObject(harvestConsul);
    }

    TryFindNewObjects(force: boolean = false) {
        // (TODO): Add hostile objects.
        this.TryLoadObjects(FIND_DROPPED_RESOURCES, 5, MASTER_ROOMOBJECT_MEMORY_ID, force);
        this.TryLoadObjects(FIND_TOMBSTONES, 11, MASTER_ROOMOBJECT_MEMORY_ID, force);
        this.TryLoadObjects(FIND_STRUCTURES, 17, MASTER_STRUCTURE_MEMORY_ID, force);
        this.TryLoadObjects(FIND_CONSTRUCTION_SITES, 29, MASTER_ROOMOBJECT_MEMORY_ID, force);
        this.TryLoadObjects(FIND_NUKES, 233, MASTER_ROOMOBJECT_MEMORY_ID, force);

    }

    private TryLoadObjects(find: FindConstant, frequency: number, dataType: string, force: boolean) {
        if (force || this.adjustedTime % frequency == 0) {
            let foundObjs = this.find(find) as SwarmObjectTypeWithID[];
            for (let i = 0; i < foundObjs.length; i++) {
                if (!SwarmLoader.HasObject(foundObjs[i].id, dataType)) {
                    SwarmLoader.LoadObject(foundObjs[i].id, foundObjs[i], dataType);
                }
            }
        }
    }

    get RoomLocation(): RoomLocationFormat { return this.name; }
    get controller(): StructureController | undefined { return this._instance.controller; }
    get energyAvailable(): number { return this._instance.energyAvailable; }
    get energyCapacityAvailable(): number { return this._instance.energyCapacityAvailable; }
    get my() { return !!(this.controller && this.controller.my); }
    get owner() { return this.controller && this.controller.owner; }
    get name(): string { return this._instance.name; }
    get storage(): StructureStorage | undefined { return this._instance.storage; }
    get terminal(): StructureTerminal | undefined { return this._instance.terminal; }
    get visual(): RoomVisual { return this._instance.visual; }

    createConstructionSite(...args: any[]) {
        console.log('createConstructionSite has been called with ' + args.length + ' args');
        if (args.length == 4) {
            return this._instance.createConstructionSite(args[0], args[1], args[2], args[3]);
        } else if (args.length == 3) {
            return this._instance.createConstructionSite(args[0], args[1], args[2]);
        } else {
            return this._instance.createConstructionSite(args[0], args[1]);
        }
    }
    //createFlag(pos: RoomPosition, color?: ColorConstant, secondaryColor?: ColorConstant, name?: string, ) {
    createFlag(...args: any[]) {
        console.log('createFlag has been called with ' + args.length + ' args');
        if (args.length == 4) {
            return this._instance.createFlag(args[0], args[1], args[2], args[3]);
        } else if (args.length == 3) {
            return this._instance.createFlag(args[0], args[1], args[2]);
        } else if (args.length == 2) {
            return this._instance.createFlag(args[0], args[1]);
        } else {
            return this._instance.createFlag(args[0]);
        }
    }
    find<T extends FindConstant>(type: T, opts?: FilterOptions<T>) {
        return this._instance.find(type, opts);
    }
    findExitTo(room: Room | string) {
        if (typeof room == "string") {
            return this._instance.findExitTo(room as string);
        }
        return this._instance.findExitTo(room);
    }
    findPath(fromPos: RoomPosition, toPos: RoomPosition, opts?: FindPathOpts) {
        return this._instance.findPath(fromPos, toPos, opts);
    }
    getPositionAt(x: number, y: number) {
        return this._instance.getPositionAt(x, y);
    }
    lookAt(...args: any[]) {
        if (args.length == 2) {
            return this._instance.lookAt(args[0], args[1])
        }
        return this._instance.lookAt(args[0]);
    }
    lookAtArea(top: number, left: number, bottom: number, right: number, asArray: boolean = false) {
        return this._instance.lookAtArea(top, left, bottom, right, asArray);
    }
    lookForAt<T extends LookConstant>(...args: any[]) {
        if (args.length == 3) {
            return this._instance.lookForAt(args[0], args[1], args[2]);
        } else {
            return this._instance.lookForAt(args[0], args[1]);
        }
    }
    lookForAtArea<T extends LookConstant>(type: T, top: number,
        left: number, bottom: number, right: number, asArray: boolean = false) {
        // lookForAtArea<T extends LookConstant>(...args: any[]) {
        if (asArray) { // Due to how lookForAtArea is set up in TS, this is the simplest way to get rid of the error.
            return this._instance.lookForAtArea<T>(type, top, left, bottom, right, true);
        } else {
            return this._instance.lookForAtArea<T>(type, top, left, bottom, right, false);
        }
    }
}
declare type RoomLocationFormat = string;