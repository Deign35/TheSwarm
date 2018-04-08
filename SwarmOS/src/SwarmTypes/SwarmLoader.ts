import { profile } from "Tools/Profiler";
import { ConsulObject, SwarmConsul } from "Consuls/ConsulBase";
import { NotImplementedException } from "Tools/SwarmExceptions";
import { MasterConsulMemory, MasterCreepMemory, MasterFlagMemory, MasterRoomMemory, MasterRoomObjectMemory, MasterStructureMemory, MasterMemory } from "SwarmMemory/MasterMemory";
import { SwarmCreep } from "./SwarmCreep";
import { CreepMemory } from "SwarmMemory/CreepMemory";
import { ObjBase, ObjectBase } from "SwarmTypes/SwarmTypes";
import { FlagMemory } from "SwarmMemory/FlagMemory";
import { SwarmMemory } from "SwarmMemory/SwarmMemory";
import { ConsulMemory, HarvestConsulMemory } from "SwarmMemory/ConsulMemory";


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
        return this.MasterMemory[dataType].GetMemoryIDs();

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
            if (!this.MasterMemory.rooms.HasMemory(keys[i])) {
                this.LoadObject(keys[i], Game.rooms[keys[i]], MASTER_ROOM_MEMORY_ID);
                let roomMem = this.MasterMemory.rooms.CheckoutMemory(keys[i]);
                let swarmObj = SwarmCreator.CreateSwarmObject(roomMem, Game.rooms[keys[i]]) as AIRoom;
                swarmObj.InitAsNew();
                this.TheSwarm.rooms[keys[i]] = swarmObj;
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

                let creepMem = this.MasterMemory.flags.CheckoutMemory(creep.name);
                let swarmObj = SwarmCreator.CreateSwarmObject(creepMem, creep) as AICreep;
                swarmObj.InitAsNew();
                this.TheSwarm.creeps[creep.name] = swarmObj;
                this.SetObjectToRoomTree(creep.room.name, creepMem);
            }
        }

        this.LoadObjectsWithName(MASTER_FLAG_MEMORY_ID);
        keys = Object.keys(Game.flags);
        for (let i = 0; i < keys.length; i++) {
            if (!this.MasterMemory.flags.HasMemory(keys[i])) {
                let flag = Game.flags[keys[i]];
                this.LoadObject(flag.name, flag, MASTER_FLAG_MEMORY_ID);

                let flagMem = this.MasterMemory.flags.CheckoutMemory(flag.name);
                let swarmObj = SwarmCreator.CreateSwarmObject(flagMem, flag) as AIFlag;
                swarmObj.InitAsNew();
                this.TheSwarm.flags[flag.name] = swarmObj;
                if (flag.room) {
                    this.SetObjectToRoomTree(flag.room.name, flagMem);
                }
            }
        }
        this.LoadObjectsWithID(MASTER_ROOMOBJECT_MEMORY_ID);
        this.LoadObjectsWithID(MASTER_STRUCTURE_MEMORY_ID);

        keys = this.MasterMemory[MASTER_CONSUL_MEMORY_ID].GetMemoryIDs();
        for (let i = 0; i < keys.length; i++) {
            let consulType = this.MasterMemory[MASTER_CONSUL_MEMORY_ID].ChildData[keys[i]].SUB_TYPE as ConsulType;
            this.LoadObject(keys[i], new ConsulObject(consulType), MASTER_CONSUL_MEMORY_ID);

            let consulMem = this.MasterMemory.consuls.CheckoutMemory(keys[i]);
            let consulObj = new ConsulObject(consulMem.SUB_TYPE as ConsulType);
            this.TheSwarm.consuls[keys[i]] = SwarmCreator.CreateSwarmObject(consulMem, consulObj) as AIConsul;
        }
    }

    static LoadObjectsWithID<T extends TStructureData | TRoomObjectData, U extends Structure | RoomObjectType>(dataType: string) {
        let keys = this.MasterMemory[dataType].GetMemoryIDs();
        for (let i = 0; i < keys.length; i++) {
            let obj = Game.getObjectById(keys[i]) as U;
            this.LoadObject<T, U>(keys[i], Game.getObjectById(keys[i]) as U, dataType);
            let objMem = this.MasterMemory[dataType].CheckoutMemory(keys[i]);
            let aiObject = SwarmCreator.CreateSwarmObject(objMem, obj);

            this.TheSwarm[dataType][keys[i]] = aiObject;
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

            let objMem = this.MasterMemory[dataType].CheckoutMemory(obj.name);
            let aiObject = SwarmCreator.CreateSwarmObject(objMem, obj);
            this.TheSwarm[dataType][keys[i]] = aiObject;

            if ((obj as Creep).room) {
                this.SetObjectToRoomTree((obj as Creep).room.name, objMem);
            }
        }
    }

    static LoadObject<T extends SwarmData, U extends SwarmObjectType>(saveID: string, obj: U, dataType: string) {
        if (!obj) {
            if (this.MasterMemory[dataType].HasMemory(saveID) && dataType != MASTER_ROOM_MEMORY_ID) {
                // (TODO): Determine what to do with hostile objects
                this.MasterMemory[dataType].DeleteMemory(saveID);
            } else {
                // Load a fake obj?
            }
            return;
        }
        let swarmType = SwarmCreator.GetSwarmType(obj);
        if (!this.MasterMemory[dataType].HasMemory(saveID)) {
            let newMem = SwarmCreator.CreateNewSwarmMemory(saveID, swarmType) as SwarmMemory;
            newMem.ReserveMemory();
            this.MasterMemory[dataType].SaveMemory(newMem);
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

    static AddConsulToTheSwarm(consul: SwarmConsul) {
        this.TheSwarm.consuls[consul.id] = consul;
    }
}