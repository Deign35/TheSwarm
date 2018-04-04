import {
    MasterCreepMemory, MasterFlagMemory, MasterRoomMemory, MasterStructureMemory,
    MasterRoomObjectMemory, MasterOtherMemory, MasterSwarmMemory, SwarmMemory
} from "SwarmMemory/SwarmMemory";
import { SwarmObject, SwarmTypeBase, ObjectBase, SwarmRoomObject } from "./SwarmTypes";
import { SwarmCreep } from "./SwarmCreep";
import { SwarmStructure } from "./SwarmStructures/SwarmStructure";
import { SwarmFlag } from "SwarmTypes/SwarmFlag";
import { SwarmRoom } from "SwarmTypes/SwarmRoom";
import { SwarmMemoryTypes } from "SwarmTypes/SwarmCreator";
import { RoomObjectMemory } from "SwarmMemory/RoomObjectMemory";
import { StructureMemory } from "SwarmMemory/StructureMemory";
import { profile } from "Tools/Profiler";
import { OtherObject } from "./OtherObjects";

@profile
export class SwarmLoader {
    protected static MasterMemory: {
        [dataType: string]: MasterSwarmMemory<MasterSwarmDataTypes, TBasicSwarmData>
    }
    static TheSwarm: {
        [dataType: string]: {
            [id: string]: ObjectBase<SwarmMemoryTypes, any>
        }
        creeps: { [id: string]: SwarmCreep },
        flags: { [id: string]: SwarmFlag },
        rooms: { [id: string]: SwarmRoom },
        roomObjects: { [id: string]: SwarmRoomObject<Source | Mineral | Nuke | Tombstone | Resource | ConstructionSite, RoomObjectMemory> },
        structures: { [id: string]: SwarmStructure<StructureConstant, Structure, StructureMemory> },
        otherData: { [id: string]: any }
    };

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
            creeps: {} as { [id: string]: SwarmCreep },
            flags: {} as { [id: string]: SwarmFlag },
            rooms: {} as { [id: string]: SwarmRoom },
            roomObjects: {} as { [id: string]: SwarmRoomObject<Source | Mineral | Nuke | Tombstone | Resource | ConstructionSite, RoomObjectMemory> },
            structures: {} as { [id: string]: SwarmStructure<StructureConstant, Structure, StructureMemory> },
            otherData: {} as { [id: string]: any }
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

        keys = this.MasterMemory.otherData.GetDataIDs();
        for (let i = 0; i < keys.length; i++) {
            this.LoadObject(keys[i], {}, SwarmControllerDataTypes.Other);
        }
    }

    static LoadObjectsWithID<T extends RoomObject, U extends SwarmMemoryTypes>(dataType: SwarmControllerDataTypes) {
        let keys = this.MasterMemory[dataType].GetDataIDs();
        for (let i = 0; i < keys.length; i++) {
            this.LoadObject<T, U>(keys[i], Game.getObjectById(keys[i]) as T, dataType);
        }
    }
    static LoadObjectsWithName<T extends Room | Creep | Flag, U extends SwarmMemoryTypes>(dataType: SwarmControllerDataTypes) {
        let keys = this.MasterMemory[dataType].GetDataIDs();
        for (let i = 0; i < keys.length; i++) {
            this.LoadObject<T, U>(keys[i], Game[dataType][keys[i]], dataType);
        }
    }

    static LoadObject<T extends any, U extends SwarmMemoryTypes>(saveID: string,
        obj: T, swarmDataType: SwarmControllerDataTypes) {
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
        let swarmObj = SwarmCreator.CreateSwarmObject(swarmType) as ObjectBase<U, T>;
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
            let subType = (swarmObj.memory as SwarmMemory<any, any>).SUB_TYPE;
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
    static SaveObjects(dataType: SwarmControllerDataTypes) {
        let keys = Object.keys(this.TheSwarm[dataType]);
        for (let i = 0; i < keys.length; i++) {
            this.MasterMemory[dataType].SaveMemory((this.TheSwarm[dataType][keys[i]]).ReleaseMemory());
        }

        Swarmlord.SaveMasterMemory(this.MasterMemory[dataType], true);
    }
}