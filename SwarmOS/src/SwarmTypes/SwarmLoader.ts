import { profile } from "Tools/Profiler";
import { MasterSwarmMemory, MasterConsulMemory, MasterCreepMemory, MasterFlagMemory, MasterRoomMemory, MasterRoomObjectMemory, MasterStructureMemory, MemObject } from "SwarmMemory/SwarmMemory";
import { Swarmlord } from "SwarmMemory/Swarmlord";
import { ConsulObject } from "Consuls/ConsulBase";
import { SwarmCreator } from "SwarmTypes/SwarmCreator";
import { NotImplementedException } from "Tools/SwarmExceptions";


@profile
export class SwarmLoader {
    protected static MasterMemory: {
        [dataType: string]: MasterSwarmMemory<SwarmDataTypeSansMaster, MasterSwarmDataTypes>,
        /*consuls: MasterConsulMemory,
        creeps: MasterCreepMemory,
        flags: MasterFlagMemory,
        otherData: MasterOtherMemory,
        rooms: MasterRoomMemory,
        roomObjects: MasterRoomObjectMemory,
        structures: MasterStructureMemory*/
    }
    static TheSwarm: {
        [dataType: string]: {
            [id: string]: AIBase<TBasicSwarmData, any>
        }

        [MASTER_CONSUL_MEMORY_ID]: { [id: string]: AIConsul },
        [MASTER_CREEP_MEMORY_ID]: { [id: string]: AICreep },
        [MASTER_FLAG_MEMORY_ID]: { [id: string]: AIFlag },
        [MASTER_ROOM_MEMORY_ID]: { [id: string]: AIRoom },
        [MASTER_ROOMOBJECT_MEMORY_ID]: { [id: string]: AIRoomObject },
        [MASTER_STRUCTURE_MEMORY_ID]: { [id: string]: AIStructure },
    };

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
    static LoadTheSwarm() {
        this.SwarmRoomIDs = {}
        global['SwarmRoomIDs'] = this.SwarmRoomIDs;
        this.TheSwarm = {
            [MASTER_CONSUL_MEMORY_ID]: {} as { [id: string]: AIConsul },
            [MASTER_CREEP_MEMORY_ID]: {} as { [id: string]: AICreep },
            [MASTER_FLAG_MEMORY_ID]: {} as { [id: string]: AIFlag },
            [MASTER_ROOM_MEMORY_ID]: {} as { [id: string]: AIRoom },
            [MASTER_ROOMOBJECT_MEMORY_ID]: {} as { [id: number]: AIRoomObject },
            [MASTER_STRUCTURE_MEMORY_ID]: {} as { [id: string]: AIStructure },
        }
        global['TheSwarm'] = this.TheSwarm;

        this.MasterMemory = {
            [MASTER_CONSUL_MEMORY_ID]: Swarmlord.CheckoutMasterMemory(MASTER_CONSUL_MEMORY_ID) as MasterConsulMemory,
            [MASTER_CREEP_MEMORY_ID]: Swarmlord.CheckoutMasterMemory(MASTER_CREEP_MEMORY_ID) as MasterCreepMemory,
            [MASTER_FLAG_MEMORY_ID]: Swarmlord.CheckoutMasterMemory(MASTER_FLAG_MEMORY_ID) as MasterFlagMemory,
            [MASTER_ROOM_MEMORY_ID]: Swarmlord.CheckoutMasterMemory(MASTER_ROOM_MEMORY_ID) as MasterRoomMemory,
            [MASTER_ROOMOBJECT_MEMORY_ID]: Swarmlord.CheckoutMasterMemory(MASTER_ROOMOBJECT_MEMORY_ID) as MasterRoomObjectMemory,
            [MASTER_STRUCTURE_MEMORY_ID]: Swarmlord.CheckoutMasterMemory(MASTER_STRUCTURE_MEMORY_ID) as MasterStructureMemory,
        };

        this.LoadObjectsWithName(MASTER_ROOM_MEMORY_ID);
        let ids = Object.keys(this.TheSwarm.rooms);
        for (let i = 0; i < ids.length; i++) {
            this.SwarmRoomIDs[ids[i]] = {
                structures: {},
                creeps: {},
                flags: {},
                roomObjects: {}
            }
        }
        this.LoadObjectsWithName(MASTER_CREEP_MEMORY_ID);
        this.LoadObjectsWithName(MASTER_FLAG_MEMORY_ID);
        this.LoadObjectsWithID(MASTER_ROOMOBJECT_MEMORY_ID);
        this.LoadObjectsWithID(MASTER_STRUCTURE_MEMORY_ID);

        let keys = Object.keys(Game.rooms);
        for (let i = 0; i < keys.length; i++) {
            if (!this.TheSwarm[MASTER_ROOM_MEMORY_ID][keys[i]]) {
                this.LoadObject(keys[i], Game.rooms[keys[i]], MASTER_ROOM_MEMORY_ID);
                this.SwarmRoomIDs[keys[i]] = {
                    structures: {},
                    creeps: {},
                    flags: {},
                    roomObjects: {}
                }
                //this.TheSwarm[MASTER_ROOM_MEMORY_ID][keys[i]].InitAsNew(Game.rooms[keys[i]]);
            }
        }
        keys = Object.keys(Game.creeps);
        for (let i = 0; i < keys.length; i++) {
            if (!this.TheSwarm[MASTER_CREEP_MEMORY_ID][keys[i]]) {
                this.LoadObject(keys[i], Game.creeps[keys[i]], MASTER_CREEP_MEMORY_ID);
                //this.TheSwarm[MASTER_CREEP_MEMORY_ID][keys[i]].InitAsNew();
            }
        }
        keys = Object.keys(Game.flags);
        for (let i = 0; i < keys.length; i++) {
            if (!this.TheSwarm[MASTER_FLAG_MEMORY_ID][keys[i]]) {
                this.LoadObject(keys[i], Game.flags[keys[i]], MASTER_FLAG_MEMORY_ID);
                //this.TheSwarm[MASTER_FLAG_MEMORY_ID][keys[i]].InitAsNew();
            }
        }

        keys = this.MasterMemory[MASTER_CONSUL_MEMORY_ID].GetMemoryIDs();
        for (let i = 0; i < keys.length; i++) {
            //this.LoadObject(keys[i], new ConsulObject(), MASTER_CONSUL_MEMORY_ID);
        }
    }

    static LoadObjectsWithID<T extends RoomObject, U extends MemObject>(dataType: string) {
        let keys = this.MasterMemory[dataType].GetMemoryIDs();
        for (let i = 0; i < keys.length; i++) {
            this.LoadObject<T, U>(keys[i], Game.getObjectById(keys[i]) as T, dataType);
        }
    }
    static LoadObjectsWithName<T extends Room | Creep | Flag, U extends MemObject>(dataType: string) {
        let keys = this.MasterMemory[dataType].GetMemoryIDs();
        for (let i = 0; i < keys.length; i++) {
            this.LoadObject<T, U>(keys[i], Game[dataType][keys[i]], dataType);
        }
    }

    static LoadObject<T extends SwarmObjectType, U extends MemObject>(saveID: string,
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
            let newMem = SwarmCreator.CreateNewSwarmMemory(saveID, swarmType) as MemObject;
            /*let swarmObj = SwarmCreator.CreateSwarmObject(swarmType, newMem.SUB_TYPE);
            swarmObj.AssignObject(obj, newMem);
            this.MasterMemory[swarmDataType].SaveMemory(swarmObj.ReleaseMemory());*/
        }

        let objMem = this.MasterMemory[swarmDataType].CheckoutMemory(saveID);
        //let swarmObj = SwarmCreator.CreateSwarmObject(swarmType, objMem.SUB_TYPE);
        //swarmObj.AssignObject(obj, objMem);

        //this.TheSwarm[swarmDataType][saveID] = swarmObj;
        if (swarmDataType == MASTER_CREEP_MEMORY_ID ||
            swarmDataType == MASTER_FLAG_MEMORY_ID ||
            swarmDataType == MASTER_ROOMOBJECT_MEMORY_ID ||
            swarmDataType == MASTER_STRUCTURE_MEMORY_ID) {
            //this.SetObjectToRoomTree(swarmObj as SwarmObject<any, any>);
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
    /*
        protected static SetObjectToRoomTree(swarmObj: SwarmObject<any, any>) {
            if (swarmObj.room) {
                let roomName = swarmObj.room.name;
                let swarmType = swarmObj.GetSwarmType();
                let subType = swarmObj.memory.SUB_TYPE;
                let objCategory = this.GetSwarmControllerDataTypeFromObject(swarmType);
                if (!this.SwarmRoomIDs[roomName][objCategory][subType]) {
                    this.SwarmRoomIDs[roomName][objCategory][subType] = [];
                }
                this.SwarmRoomIDs[roomName][objCategory][subType].push(swarmObj.saveID);
            }
        }
    */
    static SaveTheSwarm() {
        this.SaveObjects(MASTER_CONSUL_MEMORY_ID);
        this.SaveObjects(MASTER_CREEP_MEMORY_ID);
        this.SaveObjects(MASTER_FLAG_MEMORY_ID);
        this.SaveObjects(MASTER_ROOM_MEMORY_ID);
        this.SaveObjects(MASTER_ROOMOBJECT_MEMORY_ID);
        this.SaveObjects(MASTER_STRUCTURE_MEMORY_ID);
    }

    static SaveObjects(dataType: string) {
        let keys = Object.keys(this.TheSwarm[dataType]);
        for (let i = 0; i < keys.length; i++) {
            this.MasterMemory[dataType].SaveMemory((this.TheSwarm[dataType][keys[i]]).ReleaseMemory());
        }

        Swarmlord.SaveMasterMemory(this.MasterMemory[dataType], true);
    }
}