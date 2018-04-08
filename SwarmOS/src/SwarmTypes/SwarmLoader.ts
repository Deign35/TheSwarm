import { profile } from "Tools/Profiler";
import { ConsulObject, SwarmConsul } from "Consuls/ConsulBase";
import { NotImplementedException } from "Tools/SwarmExceptions";
import { SwarmCreep } from "./SwarmCreep";
import { ObjBase, ObjectBase } from "SwarmTypes/SwarmTypes";
import { ParentMemory, MemoryObject } from "SwarmMemory/SwarmMemory";


@profile
export class SwarmLoader {
    static MasterMemoryIds = [MASTER_CONSUL_MEMORY_ID, MASTER_CREEP_MEMORY_ID, MASTER_FLAG_MEMORY_ID,
        MASTER_ROOM_MEMORY_ID, MASTER_ROOMOBJECT_MEMORY_ID, MASTER_STRUCTURE_MEMORY_ID]
    protected static MasterMemory: {
        [id: string]: ParentMemory,
        [MASTER_CONSUL_MEMORY_ID]: ParentMemory,
        [MASTER_CREEP_MEMORY_ID]: ParentMemory,
        [MASTER_FLAG_MEMORY_ID]: ParentMemory,
        [MASTER_ROOM_MEMORY_ID]: ParentMemory,
        [MASTER_ROOMOBJECT_MEMORY_ID]: ParentMemory,
        [MASTER_STRUCTURE_MEMORY_ID]: ParentMemory
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
        return this.MasterMemory[dataType].GetMemoryIDs();

    }
    static LoadTheSwarm() {
        this.SwarmRoomIDs = {}
        global['SwarmRoomIDs'] = this.SwarmRoomIDs;

        this.MasterMemory = {
            [MASTER_CONSUL_MEMORY_ID]: Swarmlord.CheckoutMasterMemory(MASTER_CONSUL_MEMORY_ID),
            [MASTER_CREEP_MEMORY_ID]: Swarmlord.CheckoutMasterMemory(MASTER_CREEP_MEMORY_ID),
            [MASTER_FLAG_MEMORY_ID]: Swarmlord.CheckoutMasterMemory(MASTER_FLAG_MEMORY_ID),
            [MASTER_ROOM_MEMORY_ID]: Swarmlord.CheckoutMasterMemory(MASTER_ROOM_MEMORY_ID),
            [MASTER_ROOMOBJECT_MEMORY_ID]: Swarmlord.CheckoutMasterMemory(MASTER_ROOMOBJECT_MEMORY_ID),
            [MASTER_STRUCTURE_MEMORY_ID]: Swarmlord.CheckoutMasterMemory(MASTER_STRUCTURE_MEMORY_ID),
        };
        this.TheSwarm = {
            [MASTER_CONSUL_MEMORY_ID]: {},
            [MASTER_CREEP_MEMORY_ID]: {},
            [MASTER_FLAG_MEMORY_ID]: {},
            [MASTER_ROOM_MEMORY_ID]: {},
            [MASTER_ROOMOBJECT_MEMORY_ID]: {},
            [MASTER_STRUCTURE_MEMORY_ID]: {},
        };

        this.LoadObjectsWithName(MASTER_ROOM_MEMORY_ID);
        let keys = Object.keys(Game.rooms);
        for (let i = 0; i < keys.length; i++) {
            if (!this.MasterMemory.rooms.HasData(keys[i])) {
                this.LoadObject(keys[i], Game.rooms[keys[i]], MASTER_ROOM_MEMORY_ID);
                let roomMem = this.MasterMemory.rooms.CheckoutChildMemory(keys[i]);
                let swarmObj = SwarmCreator.CreateSwarmObject(roomMem, Game.rooms[keys[i]]) as AIRoom;
                swarmObj.InitAsNew();
            }
        }
        this.LoadObjectsWithName(MASTER_CREEP_MEMORY_ID);
        keys = Object.keys(Game.creeps);
        for (let i = 0; i < keys.length; i++) {
            if (!this.MasterMemory.creeps.HasData(keys[i])) {
                let creep = Game.creeps[keys[i]];
                this.LoadObject(creep.name, creep, MASTER_CREEP_MEMORY_ID);

                let creepMem = this.MasterMemory.flags.CheckoutChildMemory(creep.name);
                let swarmObj = SwarmCreator.CreateSwarmObject(creepMem, creep) as AICreep;
                swarmObj.InitAsNew();
                this.SetObjectToRoomTree(creep.room.name, creepMem);
            }
        }

        this.LoadObjectsWithName(MASTER_FLAG_MEMORY_ID);
        keys = Object.keys(Game.flags);
        for (let i = 0; i < keys.length; i++) {
            if (!this.MasterMemory.flags.HasData(keys[i])) {
                let flag = Game.flags[keys[i]];
                this.LoadObject(flag.name, flag, MASTER_FLAG_MEMORY_ID);

                let flagMem = this.MasterMemory.flags.CheckoutChildMemory(flag.name);
                let swarmObj = SwarmCreator.CreateSwarmObject(flagMem, flag) as AIFlag;
                swarmObj.InitAsNew();
                if (flag.room) {
                    this.SetObjectToRoomTree(flag.room.name, flagMem);
                }
            }
        }
        this.LoadObjectsWithID(MASTER_ROOMOBJECT_MEMORY_ID);
        this.LoadObjectsWithID(MASTER_STRUCTURE_MEMORY_ID);

        keys = this.MasterMemory[MASTER_CONSUL_MEMORY_ID].GetMemoryIDs();
        for (let i = 0; i < keys.length; i++) {
            let consulMem = this.MasterMemory.consuls.CheckoutChildMemory(keys[i]);
            let consulObj = new ConsulObject(consulMem.SUB_TYPE as ConsulType);
            this.LoadObject(keys[i], consulObj, MASTER_CONSUL_MEMORY_ID);

        }
    }

    static LoadObjectsWithID<T extends TStructureData | TRoomObjectData, U extends Structure | RoomObjectType>(dataType: string) {
        let keys = this.MasterMemory[dataType].GetMemoryIDs();
        for (let i = 0; i < keys.length; i++) {
            let obj = Game.getObjectById(keys[i]) as U;
            this.LoadObject<T, U>(keys[i], Game.getObjectById(keys[i]) as U, dataType);

            let objMem = this.MasterMemory[dataType].CheckoutChildMemory(keys[i]);
            if (obj.room) {
                this.SetObjectToRoomTree(obj.room.name, objMem);
            }
        }
    }
    static LoadObjectsWithName<T extends SwarmData, U extends Room | Creep | Flag>(dataType: string) {
        let keys = this.MasterMemory[dataType].GetMemoryIDs();
        for (let i = 0; i < keys.length; i++) {
            let obj = Game[dataType][keys[i]] as U;
            this.LoadObject<T, U>(obj.name, obj, dataType);
        }
    }

    static LoadObject<T extends SwarmData, U extends SwarmObjectType>(saveID: string, obj: U, dataType: string) {
        if (!obj) {
            if (this.MasterMemory[dataType].HasData(saveID) && dataType != MASTER_ROOM_MEMORY_ID) {
                // (TODO): Determine what to do with hostile objects
                this.MasterMemory[dataType].DeleteData(saveID);
            } else {
                // Load a fake obj?
            }
            return;
        }
        let swarmType = SwarmCreator.GetSwarmType(obj);
        if (!this.MasterMemory[dataType].HasData(saveID)) {
            let newMem = SwarmCreator.CreateNewSwarmMemory(saveID, swarmType) as MemoryObject;
            newMem.ReserveMemory();
            this.MasterMemory[dataType].SetData(saveID, newMem, true);
        }

        let objMem = this.MasterMemory[dataType].CheckoutChildMemory(saveID);
        this.AddObjectToTheSwarm(saveID, SwarmCreator.CreateSwarmObject(objMem, obj));
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

    protected static SetObjectToRoomTree(roomName: string, swarmMem: MemoryObject) {
        let objCategory = this.GetSwarmControllerDataTypeFromObject(swarmMem.SWARM_TYPE);
        if (!this.SwarmRoomIDs[roomName][objCategory][swarmMem.SUB_TYPE]) {
            this.SwarmRoomIDs[roomName][objCategory][swarmMem.SUB_TYPE] = [];
        }
        this.SwarmRoomIDs[roomName][objCategory][swarmMem.SUB_TYPE].push(swarmMem.id);
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

    static AddObjectToTheSwarm(saveID: string, obj: AIObject) {
        let dataType = this.GetSwarmControllerDataTypeFromObject(obj.GetSwarmType());
        this.TheSwarm[dataType][saveID] = obj;
        if ((obj.prototype as Room).createConstructionSite) {
            this.SwarmRoomIDs[saveID] = {
                structures: {},
                creeps: {},
                flags: {},
                roomObjects: {}
            }
        }
        if ((obj.prototype as Creep).room) {
            let objMem = this.MasterMemory[dataType].CheckoutChildMemory(saveID);
            this.SetObjectToRoomTree((obj.prototype as Creep).room.name, objMem);
        }
    }
}