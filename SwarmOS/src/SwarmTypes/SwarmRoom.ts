import { RoomMemory } from "SwarmMemory/StorageMemory";
import { profile } from "Tools/Profiler";
import { SwarmItemWithName, SwarmObject, SwarmMineral } from "SwarmTypes/SwarmTypes";
import { NotImplementedException } from "Tools/SwarmExceptions";
import { SwarmSource } from "./SwarmSource";
import { SwarmContainer } from "SwarmTypes/SwarmStructures/SwarmStructure";

const ROOM_COUNTER = 'CNT';
const HARVESTER_JOBS = 'HARVEST';

@profile
export class SwarmRoom extends SwarmItemWithName<IRoomMemory, Room>
    implements ISwarmRoom, Room {
    protected OnActivate(): void {
        // Do Room specific stuff here.
    }
    /*GetSwarmTypeFromObject(obj: any): SwarmType {
        if ((obj as AnyStructure).structureType) {
            debugger;
            if ((obj as ConstructionSite).progressTotal && !(obj as StructureController).reservation) {
                return SwarmType.SwarmSite;
            }
            switch ((obj as AnyStructure).structureType) {
                case (STRUCTURE_CONTAINER): return SwarmType.SwarmContainer;
                case (STRUCTURE_KEEPER_LAIR): return SwarmType.SwarmKeepersLair;
                case (STRUCTURE_PORTAL): return SwarmType.SwarmPortal;
                case (STRUCTURE_POWER_BANK): return SwarmType.SwarmPowerBank;
                case (STRUCTURE_POWER_SPAWN): return SwarmType.SwarmPowerSpawn;
                case (STRUCTURE_ROAD): return SwarmType.SwarmRoad;
                case (STRUCTURE_WALL): return SwarmType.SwarmWall;
            }
        }
        if ((obj as Mineral).mineralType) {
            return SwarmType.SwarmMineral;
        } else if ((obj as Source).energyCapacity) {
            return SwarmType.SwarmSource;
        } else if ((obj as Nuke).launchRoomName) {
            return SwarmType.SwarmNuke;
        } else if ((obj as Resource).resourceType) {
            return SwarmType.SwarmResource;
        } else if ((obj as Tombstone).deathTime) {
            return SwarmType.SwarmTombstone;
        }

        throw new NotImplementedException('Not an implemented RoomObject ' + JSON.stringify(obj));
    }

    PrepareTheSwarm(): void {
        let roomObjects = {};
        if (Game.time % 1117 == 0) {
            let nukes = this.find(FIND_NUKES);
            for (let i = 0; i < nukes.length; i++) {
                roomObjects[nukes[i].id] = nukes[i];
            }
        }
        if (Game.time % 103 == 0) {
            let neutralStructures = this.find(FIND_STRUCTURES, {
                filter: function (struct) {
                    return struct.structureType == STRUCTURE_CONTAINER ||
                        struct.structureType == STRUCTURE_PORTAL ||
                        struct.structureType == STRUCTURE_ROAD ||
                        struct.structureType == STRUCTURE_WALL
                }
            });

            for (let i = 0; i < neutralStructures.length; i++) {
                roomObjects[neutralStructures[i].id] = neutralStructures[i];
            }
        }

        if (Game.time % 5 == 0) {
            let resources = this.find(FIND_DROPPED_RESOURCES);
            for (let i = 0; i < resources.length; i++) {
                roomObjects[resources[i].id] = resources[i];
            }
        }

        if (Game.time % 7 == 0) {
            let tombstones = this.find(FIND_TOMBSTONES);
            for (let i = 0; i < tombstones.length; i++) {
                roomObjects[tombstones[i].id] = tombstones[i];
            }
        }

        if (Game.time % 11 == 0) {
            let constructionSites = this.find(FIND_CONSTRUCTION_SITES);
            for (let i = 0; i < constructionSites.length; i++) {
                roomObjects[constructionSites[i].id] = constructionSites[i];
            }
        }

        let AllMemory = this._memory.GetData("RoomObjects");
        let SwarmObjects = {};
        for (let id in AllMemory) {
            let obj = Game.getObjectById(id);
            if (!obj) {
                // object gone, remove it
                delete AllMemory[id];
                continue;
            }
            let swarmObj = SwarmCreator.CreateSwarmObject(AllMemory[id]['SWARM_TYPE']);
            let swarmMem = SwarmCreator.CreateSwarmMemory(AllMemory[id]);
            swarmMem.ReserveMemory();
            swarmObj.AssignObject(obj, swarmMem);
            SwarmObjects[id] = swarmObj;

            if (roomObjects[id]) {
                delete roomObjects[id];
            }
        }

        for (let id in roomObjects) {
            let swarmType = this.GetSwarmTypeFromObject(roomObjects[id]);
            let newObj = SwarmCreator.CreateSwarmObject(swarmType);
            let newMem = SwarmCreator.CreateNewSwarmMemory(id, swarmType);
            newMem.ReserveMemory();
            newObj.AssignObject(roomObjects[id], newMem);
            SwarmObjects[id] = newObj;
        }

        this.roomObjects = SwarmObjects;
    }
    InitNewObject() {
        let roomObjects = {};
        let sources = this.find(FIND_SOURCES);
        for (let i = 0; i < sources.length; i++) {
            let obj = SwarmCreator.CreateSwarmObject(SwarmType.SwarmSource) as SwarmSource;
            let newMem = SwarmCreator.CreateNewSwarmMemory(sources[i].id, SwarmType.SwarmSource);
            newMem.ReserveMemory();
            obj.AssignObject(sources[i], newMem as IRoomObjectMemory);
            obj.InitNewObject();
            roomObjects[obj.saveID] = obj.GetCopyOfMemory().ReleaseMemory();
        }
        let minerals = this.find(FIND_MINERALS);
        for (let i = 0; i < minerals.length; i++) {
            let obj = SwarmCreator.CreateSwarmObject(SwarmType.SwarmMineral) as SwarmMineral;
            let newMem = SwarmCreator.CreateNewSwarmMemory(sources[i].id, SwarmType.SwarmMineral);
            newMem.ReserveMemory();
            obj.AssignObject(minerals[i], newMem as IRoomObjectMemory);
            obj.InitNewObject();
            roomObjects[obj.saveID] = obj.GetCopyOfMemory().ReleaseMemory();
        }

        let neutralStructures = this.find(FIND_STRUCTURES, {
            filter: function (struct) {
                return struct.structureType == STRUCTURE_KEEPER_LAIR ||
                    struct.structureType == STRUCTURE_POWER_BANK ||
                    struct.structureType == STRUCTURE_POWER_SPAWN;
            }
        })
        for (let i = 0; i < neutralStructures.length; i++) {
            let structure = neutralStructures[i];
            let swarmType = this.GetSwarmTypeFromObject(structure);
            let newObj = SwarmCreator.CreateSwarmObject(swarmType) as SwarmContainer;
            let newMem = SwarmCreator.CreateNewSwarmMemory(structure.id, swarmType);
            newMem.ReserveMemory();
            newObj.AssignObject(structure as SwarmContainer, newMem as IStructureMemory);
            newObj.InitNewObject();
            roomObjects[newObj.saveID] = newObj.GetCopyOfMemory().ReleaseMemory();
        }

        this._memory.SetData('RoomObjects', roomObjects);
    }*/
    get DataType(): SwarmDataType.Room { return SwarmDataType.Room };
    get saveID() { return this.name; }
    get SwarmType(): SwarmType.SwarmRoom { return SwarmType.SwarmRoom; }
    get RoomLocation(): RoomLocationFormat { return this.name; }
    get controller(): StructureController | undefined { return this._instance.controller; }
    get energyAvailable(): number { return 0; }
    get energyCapacityAvailable(): number { return 0; }
    get memory() { return this._memory; }
    get my() { return !!(this.controller && this.controller.my); }
    get mode() { return this._instance.mode; }
    get owner() { return this.controller && this.controller.owner; }
    get name(): string { return this._instance.name.slice(); }
    get storage(): StructureStorage | undefined { return this._instance.storage; }
    get terminal(): StructureTerminal | undefined { return this._instance.terminal; }
    get visual(): RoomVisual { return this._instance.visual; }

    createConstructionSite(...args: any[]) {
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
        console.log('{SEARCH FOR ME}');
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