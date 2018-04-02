import {
    MasterCreepMemory, MasterFlagMemory, MasterRoomMemory, MasterStructureMemory,
    MasterRoomObjectMemory, MasterOtherMemory, RoomObjectMemory
} from "SwarmMemory/StorageMemory";
import { SwarmObject, SwarmTypeBase } from "./SwarmTypes";
import { SwarmCreep } from "./SwarmCreep";
import { SwarmStructure } from "./SwarmStructures/SwarmStructure";

const STATIC_OBJECTS = 'static_objects';
const ROOM_OBJECTS = 'room_objects';
const STRUCTURE_OBJECTS = 'structure_objects'

declare type SwarmRoomObjects = SwarmCreep | SwarmStructure<StructureConstant, Structure> |
    SwarmObject<SwarmMemoryTypes, RoomObject>
export class SwarmLoader {
    protected static MasterMemory: { [dataType: string]: IMasterMemory<MasterSwarmDataTypes, SwarmMemoryTypes> }
    static TheSwarm: { [dataType: string]: { [id: string]: ISwarmObject<SwarmMemoryTypes, any> } };

    static SwarmRoomIDs: {
        [roomID: string]: {
            structures: {
                [structureType: string]: string[],
            }
            creeps: {
                [creepType: string]: string[]
            }
            flags: {
                [flagType: string]: string[]
            }
            roomObjects: {
                [roomObjectTypes: string]: string[]
            }
        }
    }
    static LoadTheSwarm() {
        this.SwarmRoomIDs = {}
        global['SwarmRoomIDs'] = this.SwarmRoomIDs;
        this.TheSwarm = {
            creeps: {} as { [id: string]: ISwarmCreep },
            flags: {} as { [id: string]: ISwarmFlag },
            rooms: {} as { [id: string]: ISwarmRoom },
            roomObjects: {} as { [id: string]: TSwarmRoomObject },
            structures: {} as { [id: string]: TSwarmStructure },
            otherData: {} as { [id: string]: IOtherObject }
        }
        global['TheSwarm'] = this.TheSwarm;

        this.MasterMemory = {
            creeps: Swarmlord.CheckoutMasterMemory(SwarmControllerDataTypes.Creeps) as MasterCreepMemory,
            flags: Swarmlord.CheckoutMasterMemory(SwarmControllerDataTypes.Flags) as MasterFlagMemory,
            otherData: Swarmlord.CheckoutMasterMemory(SwarmControllerDataTypes.Other) as MasterOtherMemory,
            rooms: Swarmlord.CheckoutMasterMemory(SwarmControllerDataTypes.Rooms) as MasterRoomMemory,
            roomObjects: Swarmlord.CheckoutMasterMemory(SwarmControllerDataTypes.RoomObjects) as MasterRoomObjectMemory,
            structures: Swarmlord.CheckoutMasterMemory(SwarmControllerDataTypes.Structures) as MasterStructureMemory,
        };
        this.LoadObjectsWithName(SwarmControllerDataTypes.Rooms);
        let ids = Object.keys(this.TheSwarm.rooms);
        for (let i = 0; i < ids.length; i++) {
            this.SwarmRoomIDs[ids[i]] = {
                structures: {},
                creeps: {},
                flags: {},
                roomObjects: {}
            }
        }
        this.LoadObjectsWithName(SwarmControllerDataTypes.Creeps);
        this.LoadObjectsWithName(SwarmControllerDataTypes.Flags);
        this.LoadObjectsWithID(SwarmControllerDataTypes.RoomObjects);
        this.LoadObjectsWithID(SwarmControllerDataTypes.Structures);

        /*let keys = this.MasterMemory[SwarmControllerDataTypes.Other].GetDataIDs();
        for (let i = 0; i < keys.length; i++) {
            this.LoadObject()
        }*/

        let keys = Object.keys(Game.rooms);
        for (let i = 0; i < keys.length; i++) {
            if (!this.TheSwarm[SwarmControllerDataTypes.Rooms][keys[i]]) {
                this.LoadObject(keys[i], Game.rooms[keys[i]], SwarmControllerDataTypes.Rooms);
                this.SwarmRoomIDs[keys[i]] = {
                    structures: {},
                    creeps: {},
                    flags: {},
                    roomObjects: {}
                }
                this.TheSwarm[SwarmControllerDataTypes.Rooms][keys[i]].InitAsNew();
            }
        }
        keys = Object.keys(Game.creeps);
        for (let i = 0; i < keys.length; i++) {
            if (!this.TheSwarm[SwarmControllerDataTypes.Creeps][keys[i]]) {
                this.LoadObject(keys[i], Game.creeps[keys[i]], SwarmControllerDataTypes.Creeps);
                this.TheSwarm[SwarmControllerDataTypes.Creeps][keys[i]].InitAsNew();
            }
        }
        keys = Object.keys(Game.flags);
        for (let i = 0; i < keys.length; i++) {
            if (!this.TheSwarm[SwarmControllerDataTypes.Flags][keys[i]]) {
                this.LoadObject(keys[i], Game.flags[keys[i]], SwarmControllerDataTypes.Flags);
                this.TheSwarm[SwarmControllerDataTypes.Flags][keys[i]].InitAsNew();
            }
        }
    }

    static LoadObjectsWithID<T extends RoomObject>(dataType: SwarmControllerDataTypes) {
        let keys = this.MasterMemory[dataType].GetDataIDs();
        for (let i = 0; i < keys.length; i++) {
            this.LoadObject<T>(keys[i], Game.getObjectById(keys[i]) as T, dataType);
        }
    }
    static LoadObjectsWithName<T extends Room | Creep | Flag>(dataType: SwarmControllerDataTypes) {
        let keys = this.MasterMemory[dataType].GetDataIDs();
        for (let i = 0; i < keys.length; i++) {
            this.LoadObject<T>(keys[i], Game[dataType][keys[i]], dataType);
        }
    }

    static LoadObject<T extends Room | RoomObject>(saveID: string, obj: T, swarmDataType: SwarmControllerDataTypes) {
        if (!obj) {
            if (this.MasterMemory[swarmDataType].HasData(saveID) && swarmDataType != SwarmControllerDataTypes.Rooms
                && swarmDataType != SwarmControllerDataTypes.Other) {
                this.MasterMemory[swarmDataType].RemoveData(saveID);
            } else {
                // Load a fake obj
            }
            return;
        }
        let swarmType = SwarmCreator.GetSwarmType(obj);
        let swarmObj = SwarmCreator.CreateSwarmObject(swarmType) as SwarmTypeBase<SwarmMemoryTypes, T>;
        if (!this.MasterMemory[swarmDataType].HasData(saveID)) {
            let newMem = SwarmCreator.CreateNewSwarmMemory(saveID, swarmType);
            newMem.ReserveMemory();
            swarmObj.AssignObject(obj, newMem);
            this.MasterMemory[swarmDataType].SaveMemory(swarmObj.ReleaseMemory());
        }

        let objMem = this.MasterMemory[swarmDataType].CheckoutMemory(saveID);
        swarmObj.AssignObject(obj, objMem);

        this.TheSwarm[swarmDataType][saveID] = swarmObj;
        if (swarmDataType != SwarmControllerDataTypes.Rooms && swarmDataType != SwarmControllerDataTypes.Other) {
            this.SetObjectToRoomTree(swarmObj as SwarmObject<any, any>);
        }
    }

    static GetSwarmControllerDataTypeFromObject(swarmType: SwarmType) {
        switch (swarmType) {
            case (SwarmType.Any):
                return SwarmControllerDataTypes.Other;
            case (SwarmType.SwarmCreep):
                return SwarmControllerDataTypes.Creeps;
            case (SwarmType.SwarmRoom):
                return SwarmControllerDataTypes.Rooms;
            case (SwarmType.SwarmFlag):
                return SwarmControllerDataTypes.Flags;
            case (SwarmType.SwarmMineral):
            case (SwarmType.SwarmNuke):
            case (SwarmType.SwarmResource):
            case (SwarmType.SwarmSite):
            case (SwarmType.SwarmSource):
            case (SwarmType.SwarmTombstone):
                return SwarmControllerDataTypes.RoomObjects;
            default:
                return SwarmControllerDataTypes.Structures;
        }
    }

    protected static SetObjectToRoomTree(swarmObj: SwarmObject<any, any>) {
        if (swarmObj.room) {
            let roomName = swarmObj.room.name;
            let swarmType = swarmObj.GetSwarmType();
            let subType = (swarmObj as SwarmCreep).memory.SUB_TYPE;
            let objCategory = this.GetSwarmControllerDataTypeFromObject(swarmType);
            if (!this.SwarmRoomIDs[roomName][objCategory][subType]) {
                this.SwarmRoomIDs[roomName][objCategory][subType] = [];
            }
            this.SwarmRoomIDs[roomName][objCategory][subType].push(swarmObj.saveID);
        }
    }

    static SaveTheSwarm() {
        this.SaveObjects(SwarmControllerDataTypes.Creeps);
        this.SaveObjects(SwarmControllerDataTypes.Flags);
        this.SaveObjects(SwarmControllerDataTypes.Rooms);
        this.SaveObjects(SwarmControllerDataTypes.RoomObjects);
        this.SaveObjects(SwarmControllerDataTypes.Structures);
        this.SaveObjects(SwarmControllerDataTypes.Other);
    }
    static SaveObjects<T extends TSwarmObject>(dataType: SwarmControllerDataTypes) {
        let keys = Object.keys(this.TheSwarm[dataType]);
        for (let i = 0; i < keys.length; i++) {
            this.MasterMemory[dataType].SaveMemory((this.TheSwarm[dataType][keys[i]] as T).ReleaseMemory());
        }

        Swarmlord.SaveMasterMemory(this.MasterMemory[dataType] as MasterMemoryTypes, true);
    }
}