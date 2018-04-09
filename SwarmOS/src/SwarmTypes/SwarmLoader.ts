import { profile } from "Tools/Profiler";
import { ConsulObject, SwarmConsul } from "Consuls/ConsulBase";
import { NotImplementedException } from "Tools/SwarmExceptions";
import { SwarmCreep } from "./SwarmCreep";
import { ObjBase, ObjectBase } from "SwarmTypes/SwarmTypes";
import { ParentMemory, MemoryObject } from "SwarmMemory/SwarmMemory";
import { SwarmFlag } from "SwarmTypes/SwarmFlag";
import { SwarmRoom } from "SwarmTypes/SwarmRoom";
import { SwarmRoomObjectType } from "./SwarmRoomObjects";
import { SwarmStructure } from "./SwarmStructures/SwarmStructure";


@profile
export class SwarmLoader {
    static MasterMemoryIds = [MASTER_CONSUL_MEMORY_ID, MASTER_CREEP_MEMORY_ID, MASTER_FLAG_MEMORY_ID,
        MASTER_ROOM_MEMORY_ID, MASTER_ROOMOBJECT_MEMORY_ID, MASTER_STRUCTURE_MEMORY_ID]
    protected static MasterMemory: {
        [id: string]: ParentMemory<any>,
        [MASTER_CONSUL_MEMORY_ID]: ParentMemory<IMasterConsulData>,
        [MASTER_CREEP_MEMORY_ID]: ParentMemory<IMasterCreepData>,
        [MASTER_FLAG_MEMORY_ID]: ParentMemory<IMasterFlagData>,
        [MASTER_ROOM_MEMORY_ID]: ParentMemory<IMasterRoomData>,
        [MASTER_ROOMOBJECT_MEMORY_ID]: ParentMemory<IMasterRoomObjectData>,
        [MASTER_STRUCTURE_MEMORY_ID]: ParentMemory<IMasterStructureData>
    }
    protected static TheSwarm: {
        [dataType: string]: {
            [id: string]: ObjBase
        },
        [MASTER_CONSUL_MEMORY_ID]: { [id: string]: SwarmConsul },
        [MASTER_CREEP_MEMORY_ID]: { [id: string]: SwarmCreep },
        [MASTER_FLAG_MEMORY_ID]: { [id: string]: SwarmFlag },
        [MASTER_ROOM_MEMORY_ID]: { [id: string]: SwarmRoom },
        [MASTER_ROOMOBJECT_MEMORY_ID]: { [id: string]: SwarmRoomObjectType },
        [MASTER_STRUCTURE_MEMORY_ID]: { [id: string]: SwarmStructure }
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

        debugger;
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
        this.LoadObjectsWithName(MASTER_CREEP_MEMORY_ID);
        this.LoadObjectsWithName(MASTER_FLAG_MEMORY_ID);
        this.LoadObjectsWithID(MASTER_ROOMOBJECT_MEMORY_ID);
        this.LoadObjectsWithID(MASTER_STRUCTURE_MEMORY_ID);

        let keys = this.MasterMemory[MASTER_CONSUL_MEMORY_ID].GetMemoryIDs();
        for (let i = 0; i < keys.length; i++) {
            let consulObj = new ConsulObject(ConsulType.None);
            this.LoadObject(keys[i], consulObj, MASTER_CONSUL_MEMORY_ID);
        }

        keys = Object.keys(Game.rooms);
        for (let i = 0; i < keys.length; i++) {
            if (!this.MasterMemory.rooms.HasData(keys[i])) {
                this.LoadObject(keys[i], Game.rooms[keys[i]], MASTER_ROOM_MEMORY_ID);
            }
        }
        keys = Object.keys(Game.creeps);
        for (let i = 0; i < keys.length; i++) {
            if (!this.MasterMemory.creeps.HasData(keys[i])) {
                let creep = Game.creeps[keys[i]];
                this.LoadObject(creep.name, creep, MASTER_CREEP_MEMORY_ID);
            }
        }
        keys = Object.keys(Game.flags);
        for (let i = 0; i < keys.length; i++) {
            if (!this.MasterMemory.flags.HasData(keys[i])) {
                let flag = Game.flags[keys[i]];
                this.LoadObject(flag.name, flag, MASTER_FLAG_MEMORY_ID);
            }
        }
    }

    static LoadObjectsWithID<T extends SwarmData, U extends Structure | RoomObjectType>(dataType: string) {
        let keys = this.MasterMemory[dataType].GetMemoryIDs();
        for (let i = 0; i < keys.length; i++) {
            let obj = Game.getObjectById(keys[i]) as U;
            this.LoadObject<T, U>(keys[i], Game.getObjectById(keys[i]) as U, dataType);
        }
    }
    static LoadObjectsWithName<T extends SwarmData, U extends Room | Creep | Flag>(dataType: string) {
        let keys = this.MasterMemory[dataType].GetMemoryIDs();
        for (let i = 0; i < keys.length; i++) {
            let obj = Game[dataType][keys[i]] as U;
            this.LoadObject<T, U>(keys[i], obj, dataType);
        }
    }

    static LoadObject<T extends SwarmData, U extends SwarmObjectType>(saveID: string, obj: U, dataType: string) {
        if (!obj) {
            if (this.MasterMemory[dataType].HasData(saveID) && dataType != MASTER_ROOM_MEMORY_ID) {
                // (TODO): Determine what to do with hostile objects
                this.MasterMemory[dataType].DeleteChildMemory(saveID);
            } else {
                // Load a fake obj?
            }
            return;
        }
        if (!this.MasterMemory[dataType].HasData(saveID)) {
            let newMem = SwarmCreator.CreateNewSwarmMemory(saveID, SwarmCreator.GetSwarmType(obj)) as MemoryObject
            newMem.ReserveMemory();
            let newObj = SwarmCreator.CreateSwarmObject(obj, newMem) as ObjBase
            newObj.InitAsNew();
            this.SaveObject(newObj);
        }
        let objMem = this.MasterMemory[dataType].CheckoutChildMemory(saveID);
        this.AddObjectToTheSwarm(SwarmCreator.CreateSwarmObject(obj, objMem));
        objMem.ReleaseMemory();
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

    static SaveTheSwarm() {
        Swarmlord.SaveMasterMemory(this.MasterMemory[MASTER_CONSUL_MEMORY_ID], true);
        Swarmlord.SaveMasterMemory(this.MasterMemory[MASTER_CREEP_MEMORY_ID], true);
        Swarmlord.SaveMasterMemory(this.MasterMemory[MASTER_FLAG_MEMORY_ID], true);
        Swarmlord.SaveMasterMemory(this.MasterMemory[MASTER_ROOM_MEMORY_ID], true);
        Swarmlord.SaveMasterMemory(this.MasterMemory[MASTER_ROOMOBJECT_MEMORY_ID], true);
        Swarmlord.SaveMasterMemory(this.MasterMemory[MASTER_STRUCTURE_MEMORY_ID], true);
    }
    static HasObject(id: string, dataType: string) {
        return this.TheSwarm[dataType][id];
    }
    static GetObject<T extends ObjBase>(id: string, dataType: string): T {
        return this.TheSwarm[dataType][id] as T;
    }

    static SaveObject(obj: ObjBase) {
        this.MasterMemory[this.GetMemNameFromType(obj.GetMemType())].SaveChildMemory(obj.memory, true);
    }
    static GetMemNameFromType(dataType: SwarmDataType) {
        switch (dataType) {
            case (SwarmDataType.Consul): return MASTER_CONSUL_MEMORY_ID;
            case (SwarmDataType.Creep): return MASTER_CREEP_MEMORY_ID;
            case (SwarmDataType.Flag): return MASTER_FLAG_MEMORY_ID;
            case (SwarmDataType.Room): return MASTER_ROOM_MEMORY_ID;
            case (SwarmDataType.RoomObject): return MASTER_ROOMOBJECT_MEMORY_ID;
            case (SwarmDataType.Structure): return MASTER_STRUCTURE_MEMORY_ID;
            default: throw new NotImplementedException('Datatype is not in memory: ' + dataType);
        }
    }

    static AddObjectToTheSwarm(obj: ObjBase) {
        let dataType = this.GetSwarmControllerDataTypeFromObject(obj.GetSwarmType());
        this.TheSwarm[dataType][obj.id] = obj;
        if ((obj as SwarmCreep).room) {
            let roomName = (obj as SwarmCreep).room.name;
            let memType = obj.GetMemType();
            let subType = obj.GetSubType();
            if (!this.SwarmRoomIDs[roomName]) {
                this.SwarmRoomIDs[roomName] = {
                    structures: {} as IDictionary<string[]>,
                    creeps: {} as IDictionary<string[]>,
                    flags: {} as IDictionary<string[]>,
                    roomObjects: {} as IDictionary<string[]>
                }
            }
            if (!this.SwarmRoomIDs[roomName][dataType][subType]) {
                this.SwarmRoomIDs[roomName][dataType][subType] = [];
            }
            this.SwarmRoomIDs[roomName][dataType][subType].push(obj.id)
        }
    }
}