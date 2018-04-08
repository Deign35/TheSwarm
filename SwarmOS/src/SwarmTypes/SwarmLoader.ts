import { profile } from "Tools/Profiler";
import { ConsulObject } from "Consuls/ConsulBase";
import { NotImplementedException } from "Tools/SwarmExceptions";
import { MasterConsulMemory, MasterCreepMemory, MasterFlagMemory, MasterRoomMemory, MasterRoomObjectMemory, MasterStructureMemory, MasterMemory } from "SwarmMemory/MasterMemory";
import { SwarmCreep } from "./SwarmCreep";
import { CreepMemory } from "SwarmMemory/CreepMemory";
import { ObjBase } from "SwarmTypes/SwarmTypes";
import { FlagMemory } from "SwarmMemory/FlagMemory";
import { SwarmMemory } from "SwarmMemory/SwarmMemory";


@profile
export class SwarmLoader {
    static MasterMemoryIds = [MASTER_CONSUL_MEMORY_ID, MASTER_CREEP_MEMORY_ID, MASTER_FLAG_MEMORY_ID,
        MASTER_ROOM_MEMORY_ID, MASTER_ROOMOBJECT_MEMORY_ID, MASTER_STRUCTURE_MEMORY_ID]
    protected static MasterMemory: {
        [dataType: string]: MasterMemory,
        [MASTER_CONSUL_MEMORY_ID]: MasterConsulMemory,
        [MASTER_CREEP_MEMORY_ID]: MasterCreepMemory,
        [MASTER_FLAG_MEMORY_ID]: MasterFlagMemory,
        [MASTER_ROOM_MEMORY_ID]: MasterRoomMemory,
        [MASTER_ROOMOBJECT_MEMORY_ID]: MasterRoomObjectMemory,
        [MASTER_STRUCTURE_MEMORY_ID]: MasterStructureMemory
    }
    protected static TheSwarm: {
        [dataType: string]: {
            [id: string]: AIObject
        },
        [MASTER_CONSUL_MEMORY_ID]: { [id: string]: AIConsul },
        [MASTER_CREEP_MEMORY_ID]: { [id: string]: AICreep },
        [MASTER_FLAG_MEMORY_ID]: { [id: string]: AIFlag },
        [MASTER_ROOM_MEMORY_ID]: { [id: string]: AIRoom },
        [MASTER_ROOMOBJECT_MEMORY_ID]: { [id: string]: AIRoomObject },
        [MASTER_STRUCTURE_MEMORY_ID]: { [id: string]: AIStructure }
    }

    static SwarmRoomIDs: {
        [roomID: string]: {
            [MASTER_CREEP_MEMORY_ID]: {
                [creepType: string]: string[]
            }
            [MASTER_FLAG_MEMORY_ID]: {
                [flagType: string]: string[]
            }
            [MASTER_ROOMOBJECT_MEMORY_ID]: {
                [roomObjectTypes: number]: string[]
            }
            [MASTER_STRUCTURE_MEMORY_ID]: {
                [structureType: string]: string[],
            }
        }
    }
    static GetTypeIDs(dataType: string) {
        return Object.keys(this.MasterMemory[dataType].GetMemoryIDs());

    }
    static LoadTheSwarm() {
        this.SwarmRoomIDs = {}
        global['SwarmRoomIDs'] = this.SwarmRoomIDs;

        this.MasterMemory = {
            [MASTER_CONSUL_MEMORY_ID]: Swarmlord.CheckoutMasterMemory(MASTER_CONSUL_MEMORY_ID) as MasterConsulMemory,
            [MASTER_CREEP_MEMORY_ID]: Swarmlord.CheckoutMasterMemory(MASTER_CREEP_MEMORY_ID) as MasterCreepMemory,
            [MASTER_FLAG_MEMORY_ID]: Swarmlord.CheckoutMasterMemory(MASTER_FLAG_MEMORY_ID) as MasterFlagMemory,
            [MASTER_ROOM_MEMORY_ID]: Swarmlord.CheckoutMasterMemory(MASTER_ROOM_MEMORY_ID) as MasterRoomMemory,
            [MASTER_ROOMOBJECT_MEMORY_ID]: Swarmlord.CheckoutMasterMemory(MASTER_ROOMOBJECT_MEMORY_ID) as MasterRoomObjectMemory,
            [MASTER_STRUCTURE_MEMORY_ID]: Swarmlord.CheckoutMasterMemory(MASTER_STRUCTURE_MEMORY_ID) as MasterStructureMemory,
        };

        this.LoadObjectsWithName(MASTER_ROOM_MEMORY_ID);
        let keys = Object.keys(Game.rooms);
        for (let i = 0; i < keys.length; i++) {
            if (!this.MasterMemory.rooms.HasMemory(keys[i])) {
                this.LoadObject(keys[i], Game.rooms[keys[i]], MASTER_ROOM_MEMORY_ID);
            }
        }
        let ids = this.MasterMemory.rooms.GetMemoryIDs();
        for (let i = 0; i < ids.length; i++) {
            this.SwarmRoomIDs[ids[i]] = {
                structures: {},
                creeps: {},
                flags: {},
                roomObjects: {}
            }
        }

        this.LoadObjectsWithName(MASTER_CREEP_MEMORY_ID);
        keys = Object.keys(Game.creeps);
        for (let i = 0; i < keys.length; i++) {
            if (!this.MasterMemory.creeps.HasMemory(keys[i])) {
                let creep = Game.creeps[keys[i]];
                this.LoadObject(creep.name, creep, MASTER_CREEP_MEMORY_ID);

                let newMem = this.MasterMemory.creeps.CheckoutMemory(creep.name);
                let creepObject = SwarmCreator.CreateSwarmObject(newMem, creep) as AICreep;
                creepObject.InitAsNew();

                this.TheSwarm.creeps[creep.name] = creepObject;
                this.SwarmRoomIDs[creep.room.name].creeps[newMem.SUB_TYPE].push(creep.name);
            }
        }

        this.LoadObjectsWithName(MASTER_FLAG_MEMORY_ID);
        keys = Object.keys(Game.flags);
        for (let i = 0; i < keys.length; i++) {
            if (!this.MasterMemory.flags.HasMemory(keys[i])) {
                let flag = Game.flags[keys[i]];
                this.LoadObject(flag.name, flag, MASTER_CREEP_MEMORY_ID);

                let newMem = this.MasterMemory.flags.CheckoutMemory(flag.name);
                let flagObject = SwarmCreator.CreateSwarmObject(newMem, flag) as AIFlag;
                flagObject.InitAsNew();

                this.TheSwarm.flags[flag.name] = flagObject;
                if (flag.room) {
                    this.SwarmRoomIDs[flag.room.name].creeps[newMem.SUB_TYPE].push(flag.name);
                }
            }
        }
        this.LoadObjectsWithID(MASTER_ROOMOBJECT_MEMORY_ID);
        this.LoadObjectsWithID(MASTER_STRUCTURE_MEMORY_ID);

        keys = this.MasterMemory[MASTER_CONSUL_MEMORY_ID].GetMemoryIDs();
        for (let i = 0; i < keys.length; i++) {
            let consulType = this.MasterMemory[MASTER_CONSUL_MEMORY_ID].ChildData[keys[i]].SUB_TYPE as ConsulType;
            this.LoadObject(keys[i], new ConsulObject(consulType), MASTER_CONSUL_MEMORY_ID);
        }
    }

    static LoadObjectsWithID<T extends RoomObject, U extends SwarmData>(dataType: string) {
        let keys = this.MasterMemory[dataType].GetMemoryIDs();
        for (let i = 0; i < keys.length; i++) {
            this.LoadObject<T, U>(keys[i], Game.getObjectById(keys[i]) as T, dataType);
        }
    }
    static LoadObjectsWithName<T extends Room | Creep | Flag, U extends SwarmData>(dataType: string) {
        let keys = this.MasterMemory[dataType].GetMemoryIDs();
        for (let i = 0; i < keys.length; i++) {
            this.LoadObject<T, U>(keys[i], Game[dataType][keys[i]], dataType);
        }
    }

    static LoadObject<T extends SwarmObjectType, U extends SwarmData>(saveID: string,
        obj: T, swarmDataType: string) {
        if (!obj) {
            if (this.MasterMemory[swarmDataType].HasMemory(saveID) && swarmDataType != MASTER_ROOM_MEMORY_ID) {
                // (TODO): Determine what to do with hostile objects
                this.MasterMemory[swarmDataType].DeleteMemory(saveID);
            } else {
                // Load a fake obj?
            }
            return;
        }
        let swarmType = SwarmCreator.GetSwarmType(obj);
        if (!this.MasterMemory[swarmDataType].HasMemory(saveID)) {
            let newMem = SwarmCreator.CreateNewSwarmMemory(saveID, swarmType) as SwarmMemory;
            newMem.ReserveMemory();
            this.MasterMemory[swarmDataType].SaveMemory(newMem);
        }

        if ((obj as RoomObject).room) {
            let objMem = this.MasterMemory[swarmDataType].CheckoutMemory(saveID);
            this.SetObjectToRoomTree((obj as RoomObject).room!.name, objMem);
            this.MasterMemory[swarmDataType].SaveMemory(objMem);
        }
    }

    static GetSwarmControllerDataTypeFromObject(swarmType: SwarmType) {
        switch (swarmType) {
            case (SwarmType.None):
                throw new NotImplementedException("Swarmtype.None is not implemented");
            case (SwarmType.SwarmCreep):
                return MASTER_CREEP_MEMORY_ID;
            case (SwarmType.SwarmRoom):
                return MASTER_ROOM_MEMORY_ID;
            case (SwarmType.SwarmFlag):
                return MASTER_FLAG_MEMORY_ID;
            case (SwarmType.SwarmConsul):
                return MASTER_CONSUL_MEMORY_ID;
            case (SwarmType.SwarmMineral):
            case (SwarmType.SwarmNuke):
            case (SwarmType.SwarmResource):
            case (SwarmType.SwarmSite):
            case (SwarmType.SwarmSource):
            case (SwarmType.SwarmTombstone):
                return MASTER_ROOMOBJECT_MEMORY_ID;
            default:
                return MASTER_STRUCTURE_MEMORY_ID;
        }
    }

    protected static SetObjectToRoomTree(roomName: string, swarmMem: SwarmMemory) {
        let objCategory = this.GetSwarmControllerDataTypeFromObject(swarmMem.SWARM_TYPE);
        if (!this.SwarmRoomIDs[roomName][objCategory][swarmMem.SUB_TYPE]) {
            this.SwarmRoomIDs[roomName][objCategory][swarmMem.SUB_TYPE] = [];
        }
        this.SwarmRoomIDs[roomName][objCategory][swarmMem.SUB_TYPE].push(swarmMem.id);
        this.TheSwarm[swarmMem.MEM_TYPE][swarmMem.id];
    }

    static SaveTheSwarm() {
        Swarmlord.SaveMasterMemory(this.MasterMemory[MASTER_CONSUL_MEMORY_ID], true);
        Swarmlord.SaveMasterMemory(this.MasterMemory[MASTER_CREEP_MEMORY_ID], true);
        Swarmlord.SaveMasterMemory(this.MasterMemory[MASTER_FLAG_MEMORY_ID], true);
        Swarmlord.SaveMasterMemory(this.MasterMemory[MASTER_ROOM_MEMORY_ID], true);
        Swarmlord.SaveMasterMemory(this.MasterMemory[MASTER_ROOMOBJECT_MEMORY_ID], true);
        Swarmlord.SaveMasterMemory(this.MasterMemory[MASTER_STRUCTURE_MEMORY_ID], true);
    }
    static GetObject(id: string, dataType: string) {
        return this.TheSwarm[dataType][id];
    }
}