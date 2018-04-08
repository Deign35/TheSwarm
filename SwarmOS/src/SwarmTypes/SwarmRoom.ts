import { profile } from "Tools/Profiler";
import { SwarmTypeBase } from "SwarmTypes/SwarmTypes";
import { SwarmSpawn } from "SwarmTypes/SwarmStructures/SwarmSpawn";
import { SwarmLoader } from "SwarmTypes/SwarmLoader";
import { ConsulObject } from "Consuls/ConsulBase";
import { MemoryObject } from "SwarmMemory/SwarmMemory";

/*<T extends CreepType> extends OwnableSwarmObject<ICreepData<T>, Creep>
    implements AICreep, Creep {
    Activate(mem: ICreepData<T>, obj: Creep): ICreepData<T> {
        throw new Error("Method not implemented.");
    }
    InitAsNew(obj: Creep): ICreepData<T> {
        throw new Error("Method not implemented.");
    }
    PrepObject(mem: ICreepData<T>, obj: Creep): ICreepData<T> {
        throw new Error("Method not implemented.");
    }*/
export type SwarmRoom = SwarmRoom_Base<RoomType>;
@profile
export class SwarmRoom_Base<T extends RoomType> extends SwarmTypeBase<IData, Room> implements AIRoom, Room {
    GetSwarmSubType(): T {
        return this.memory.SUB_TYPE as T;
    }
    private _availableSpawns!: string[];
    protected get spawns(): string[] {
        if (!this._availableSpawns) {
            this._availableSpawns = [];
            let ids = SwarmLoader.SwarmRoomIDs[this.saveID].structures[STRUCTURE_SPAWN];
            if (ids) {
                for (let i = 0; i < ids.length; i++) {
                    /*let spawn = SwarmLoader.TheSwarm.structures[ids[i]] as SwarmSpawn;
                    if (!spawn.spawning) {
                        this._availableSpawns.push(ids[i]);
                    }*/
                }
            }
        }
        return this._availableSpawns;
    }

    TrySpawn(body: BodyPartConstant[], name: string,
        opts?: {
            memory?: TCreepData,
            energyStructures?: Array<(StructureSpawn | StructureExtension)>,
            directions?: DirectionConstant[],
            spawnID?: string
        }) {
        let spawnToUse: SwarmSpawn | undefined;
        if (opts && opts.spawnID) {
            // get spawn this way instead
            //spawnToUse = SwarmLoader.TheSwarm.structures[opts.spawnID] as SwarmSpawn;
        } else if (this.spawns.length > 0) {
            if (GetSpawnCost(body) <= this.energyAvailable) {
                //spawnToUse = SwarmLoader.TheSwarm.structures[this.spawns.shift()!] as SwarmSpawn;
            } else {
                return E_REQUIRES_ENERGY;
            }
        } else {
            return E_MISSING_TARGET;
        }

        if (spawnToUse) {
            return spawnToUse.spawnCreep(body, name, opts);
        }

        return E_MISSING_TARGET;
    }

    InitAsNew() {
        SwarmLogger.Log("Initializing a new room");
        let roomType = this.controller && this.controller.owner && this.controller.owner.username == MY_USERNAME &&
            this.controller.level;// RCL1 - RCL8 if I own the room

        if (!roomType) {
            // Not mine, what is it?
            if (this.controller) {
                roomType = RoomType.NonHostile;
                if (this.controller.owner) {
                    roomType = RoomType.Hostile;
                } else if (this.controller.reservation) {
                    if (this.controller.reservation.username == MY_USERNAME) {
                        roomType = RoomType.HarvestSupport;
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
        }

        this.memory.SetData(SUB_TYPE, roomType, true)

        // Would love to add a pathfinding.
        let sources = this.find(FIND_SOURCES);
        for (let i = 0; i < sources.length; i++) {
            SwarmLoader.LoadObject(sources[i].id, sources[i], MASTER_ROOMOBJECT_MEMORY_ID);
        }
        let minerals = this.find(FIND_MINERALS);
        for (let i = 0; i < minerals.length; i++) {
            SwarmLoader.LoadObject(minerals[i].id, minerals[i], MASTER_ROOMOBJECT_MEMORY_ID);
        }
        // (TODO): Instead of TryFindNewObjects, use a single LookAtArea and find all objects for the new room.
        this.TryFindNewObjects(true);
        this.CreateHarvestConsul(sources);
    }

    CreateHarvestConsul(sources: Source[]) {
        // Find an existing harvest consul at some point, for now, one per room.
        let newHarvesterData: HarvestConsulData = {
            id: this.name + '_harvest',
            isActive: true,
            MEM_TYPE: SwarmDataType.Consul,
            sourceIDs: CopyObject(SwarmLoader.SwarmRoomIDs[this.name].roomObjects[SwarmType.SwarmSource]),
            SUB_TYPE: ConsulType.Harvest,
            SWARM_TYPE: SwarmType.SwarmConsul
        }
        let newHarvesterMem = new MemoryObject(newHarvesterData);
        newHarvesterMem.ReserveMemory();

        let consul = SwarmCreator.CreateSwarmObject(new ConsulObject(ConsulType.Harvest), newHarvesterMem);


        /*consul.AssignObject(new ConsulObject(), newHarvesterMem);
        SwarmLoader.TheSwarm.consuls[consul.saveID] = consul;*/
    }

    TryFindNewObjects(force: boolean = false) {
        /*if (force || Game.time % 5 == 0) {
            let foundResources = this.find(FIND_DROPPED_RESOURCES);
            for (let j = 0; j < foundResources.length; j++) {
                if (!SwarmLoader.TheSwarm.roomObjects[foundResources[j].id]) {
                    SwarmLoader.LoadObject<Resource, ResourceMemory>(
                        foundResources[j].id, foundResources[j], SwarmControllerDataTypes.RoomObjects);
                }
            }
        }

        if (force || Game.time % 11 == 0) {
            let foundTombstones = this.find(FIND_TOMBSTONES);
            for (let j = 0; j < foundTombstones.length; j++) {
                if (!SwarmLoader.TheSwarm.roomObjects[foundTombstones[j].id]) {
                    SwarmLoader.LoadObject<Tombstone, TombstoneMemory>(
                        foundTombstones[j].id, foundTombstones[j], SwarmControllerDataTypes.RoomObjects);
                }
            }
        }

        if (force || Game.time % 17 == 0) {
            let foundStructures = this.find(FIND_STRUCTURES);
            for (let j = 0; j < foundStructures.length; j++) {
                if (!SwarmLoader.TheSwarm.structures[foundStructures[j].id]) {
                    SwarmLoader.LoadObject<Structure, StructureMemory>(
                        foundStructures[j].id, foundStructures[j], SwarmControllerDataTypes.Structures);
                }
            }
        }

        if (force || Game.time % 29 == 0) {
            let foundSites = this.find(FIND_CONSTRUCTION_SITES);
            for (let j = 0; j < foundSites.length; j++) {
                if (!SwarmLoader.TheSwarm.roomObjects[foundSites[j].id]) {
                    SwarmLoader.LoadObject<ConstructionSite, ConstructionSiteMemory>(
                        foundSites[j].id, foundSites[j], SwarmControllerDataTypes.RoomObjects);
                }
            }
        }

        if (force || Game.time % 233 == 0) {
            let foundNukes = this.find(FIND_NUKES);
            for (let j = 0; j < foundNukes.length; j++) {
                if (!SwarmLoader.TheSwarm.roomObjects[foundNukes[j].id]) {
                    SwarmLoader.LoadObject<Nuke, NukeMemory>(
                        foundNukes[j].id, foundNukes[j], SwarmControllerDataTypes.RoomObjects);
                }
            }
        }
        */
    }

    get DataType(): SwarmDataType.Room { return SwarmDataType.Room };
    get saveID() { return this.name; }
    get SwarmType(): SwarmType.SwarmRoom { return SwarmType.SwarmRoom; }
    get RoomLocation(): RoomLocationFormat { return this.name; }
    get controller(): StructureController | undefined { return this._instance.controller; }
    get energyAvailable(): number { return this._instance.energyAvailable; }
    get energyCapacityAvailable(): number { return this._instance.energyCapacityAvailable; }
    get my() { return !!(this.controller && this.controller.my); }
    get owner() { return this.controller && this.controller.owner; }
    get name(): string { return this._instance.name.slice(); }
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