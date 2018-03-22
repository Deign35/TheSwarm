import { RoomMemory } from "SwarmMemory/StorageMemory";
import { profile } from "Tools/Profiler";
import { SwarmItemWithName } from "SwarmTypes/SwarmTypes";

const ROOM_COUNTER = 'CNT';
const HARVESTER_JOBS = 'HARVEST';
const ROOMOBJECT_DATA = 'OBJs';
@profile
export class SwarmRoom extends SwarmItemWithName<IRoomMemory, Room> implements ISwarmRoom, Room {
    get DataType(): SwarmDataType.Room { return SwarmDataType.Room };
    protected roomObjectsMemory!: any;
    /*protected roomObjects: { [id: string]: ISwarmRoomObject } = {}

    GetSwarmObject(id: string): ISwarmSource | ISwarmMineral | ISwarmNuke | ISwarmTombstone | ISwarmSite | ISwarmResource {
        return this.roomObjects[id];
    }*/

    protected OnActivate() {
        /*let curCount = this._memory.GetData<number>(ROOM_COUNTER) || 5;
        this._memory.SetData(ROOM_COUNTER, curCount + (curCount * 0.05));

        let roomObjectData = Swarmlord.ReserveMem(ROOMOBJECT_DATA, SwarmDataType.RoomObject, this._memory);
        //let roomObjectData = Swarmlord.CheckoutMemory(ROOMOBJECT_DATA, SwarmDataType.Other, this._memory);
        let harvesters = this._memory.GetData(HARVESTER_JOBS) as { sourceID: string, nextSpawnRequiredBy: number }[]
        for (let i = 0; i < harvesters.length; i++) {
            let sourceId = harvesters[i].sourceID;
            let sourceObject = Game.getObjectById(sourceId)
            let swarmObject = SwarmCreator.CreateSwarmObject(sourceObject as Source, SwarmType.SwarmSource);
            let objData = Swarmlord.ReserveMem(sourceId, SwarmDataType.RoomObject, roomObjectData);
            swarmObject.AssignMemory(objData);
            swarmObject.Activate();
            roomObjectData.SaveChildMemory(swarmObject.GetMemoryObject());
        }

        this.memory.SaveChildMemory(roomObjectData);*/
    }
    /*OnSave() {
        for (let objID in this.roomObjects) {
            Swarmlord.ReleaseMemory(this.roomObjects[objID].GetMemoryObject(), true);
        }
    }*/
    InitNewObject() {
        /*let harvesterJobs = [];
        let sources = this.find(FIND_SOURCES);
        Swarmlord.CreateNewStorageMemory(ROOMOBJECT_DATA, SwarmDataType.Other, this._memory);
        let newMem = Swarmlord.CheckoutMemory(ROOMOBJECT_DATA, SwarmDataType.Other, this._memory);
        for (let i = 0; i < sources.length; i++) {
            Swarmlord.CreateNewStorageMemory(sources[i].id, SwarmDataType.RoomObject, newMem);
            let newSourceMemory: SourceData = {
                sourceID: sources[i].id,
                nextSpawnRequiredBy: 0,
            };
            harvesterJobs.push(newSourceMemory);
        }

        this._memory.SetData(HARVESTER_JOBS, harvesterJobs);
        this._memory.SaveChildMemory(newMem);*/
    }
    get saveID() { return this.name; }
    get SwarmType(): SwarmType.SwarmRoom { return SwarmType.SwarmRoom; }
    get RoomLocation(): RoomLocationFormat { return this.name; }
    get controller(): StructureController | undefined { return this._instance.controller; }
    get energyAvailable(): number { return 0; }
    get energyCapacityAvailable(): number { return 0; }
    get memory() { return this._memory; }
    get mode() { return this._instance.mode; }
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
    findExitTo(room: SwarmRoom | string) {
        if (typeof room == "string") {
            return this._instance.findExitTo(room as string);
        }
        return this._instance.findExitTo(room._instance);
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