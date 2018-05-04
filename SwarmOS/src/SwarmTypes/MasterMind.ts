/*import { ParentMemory, MemoryBase } from "SwarmMemory/SwarmMemory";
import { ObjBase } from "./SwarmTypes";
import { ConsulObject } from "Consuls/ConsulBase";

export class MasterMind {
    private static MasterMemoryIds = [MASTER_CONSUL_MEMORY_ID, MASTER_CREEP_MEMORY_ID, MASTER_FLAG_MEMORY_ID,
        MASTER_ROOM_MEMORY_ID, MASTER_ROOMOBJECT_MEMORY_ID, MASTER_STRUCTURE_MEMORY_ID];

    private static masterMemory: { [id: string]: ParentMemory }
    private static initializedMemory: { [id: string]: { [id: string]: MemoryBase } }
    private static basicObjects: { [id: string]: { [id: string]: SwarmObjectType } }
    private static swarmObjects: { [id: string]: { [id: string]: ObjBase } }

    private static InitObjects(masterID: string, retrievalFunction: (id: string) => SwarmObjectType | undefined, initMemory: boolean) {
        if (initMemory) {
            this.masterMemory[masterID] = Swarmlord.CheckoutMasterMemory(masterID);
            this.initializedMemory[masterID] = {};
            let keys = this.masterMemory[masterID].GetMemoryIDs();
            for (let i = 0; i < keys.length; i++) {
                this.initializedMemory[masterID][keys[i]] =
                    new MemoryBase(this.masterMemory[masterID][keys[i]]);
            }
        }

        let keys = Object.keys(this.initializedMemory[masterID]);
        for (let i = 0; i < keys.length; i++) {
            let retrievedObject = retrievalFunction(keys[i]);
            if (!retrievedObject) {
                // Not sure what do...
                // Call a generic function that determines what to do with memory without an object.
            } else {
                this.basicObjects[masterID][keys[i]] = retrievedObject;
            }
        }
    }

    static InitTick() {
        if (!this.masterMemory) { this.InitMasterMind() }

        let keys = Object.keys(Game.rooms);
        for (let i = 0; i < keys.length; i++) {
            if (!this.initializedMemory[MASTER_ROOM_MEMORY_ID][keys[i]]) {
                // New room found
                this.initializedMemory[MASTER_ROOM_MEMORY_ID][keys[i]] =
                    SwarmCreator.CreateNewSwarmMemory(keys[i], SwarmType.SwarmRoom);
            }
        }
        keys = Object.keys(Game.creeps);
        for (let i = 0; i < keys.length; i++) {
            if (!this.initializedMemory[MASTER_CREEP_MEMORY_ID][keys[i]]) {
                // New room found
                this.initializedMemory[MASTER_CREEP_MEMORY_ID][keys[i]] =
                    SwarmCreator.CreateNewSwarmMemory(keys[i], SwarmType.SwarmCreep);
            }
        }
        keys = Object.keys(Game.flags);
        for (let i = 0; i < keys.length; i++) {
            if (!this.initializedMemory[MASTER_FLAG_MEMORY_ID][keys[i]]) {
                // New room found
                this.initializedMemory[MASTER_FLAG_MEMORY_ID][keys[i]] =
                    SwarmCreator.CreateNewSwarmMemory(keys[i], SwarmType.SwarmFlag);
            }
        }
    }
    private static InitMasterMind() {
        this.masterMemory = {};
        this.initializedMemory = {};
        for (let i = 0; i < this.MasterMemoryIds.length; i++) {
            this.InitMemoryByClass(this.MasterMemoryIds[i]);
        }
    }

    private static InitMemoryByClass(masterID: string) {
        this.masterMemory[masterID] = Swarmlord.CheckoutMasterMemory(masterID);
        this.initializedMemory[masterID] = {};

        let keys = this.masterMemory[masterID].GetMemoryIDs();
        for (let i = 0; i < keys.length; i++) {
            this.initializedMemory[masterID][keys[i]] =
                new MemoryBase(this.masterMemory[masterID][keys[i]]);
        }
    }

    static PrepareTick() {
        this.CollectObjects(Object.keys(Game.creeps), MASTER_CREEP_MEMORY_ID);
        this.basicObjects = {
            [MASTER_CONSUL_MEMORY_ID]: {},
            [MASTER_CREEP_MEMORY_ID]: {},
            [MASTER_FLAG_MEMORY_ID]: {},
            [MASTER_ROOM_MEMORY_ID]: {},
            [MASTER_ROOMOBJECT_MEMORY_ID]: {},
            [MASTER_STRUCTURE_MEMORY_ID]: {}
        };

        let keys = Object.keys(this.initializedMemory[MASTER_ROOM_MEMORY_ID]);
        for (let i = 0; i < keys.length; i++) {
            if (!Game.rooms[keys[i]]) {
                // Room out of view
                continue;
            }
            this.basicObjects[MASTER_ROOM_MEMORY_ID][keys[i]] = Game.rooms[keys[i]];
        }

        keys = Object.keys(this.initializedMemory[MASTER_CONSUL_MEMORY_ID]);
        for (let i = 0; i < keys.length; i++) {
            this.basicObjects[MASTER_CONSUL_MEMORY_ID][keys[i]] =
                new ConsulObject(this.initializedMemory[MASTER_CONSUL_MEMORY_ID][keys[i]].SUB_TYPE as ConsulType);
        }

        keys = Object.keys(this.initializedMemory[MASTER_CREEP_MEMORY_ID]);
        for (let i = 0; i < keys.length; i++) {
            if (!Game.creeps[keys[i]]) {
                // Creep dead.
                this.masterMemory[MASTER_CREEP_MEMORY_ID].DeleteChildMemory(keys[i]);
                delete this.initializedMemory[MASTER_CREEP_MEMORY_ID][keys[i]];
                delete this.basicObjects[MASTER_CREEP_MEMORY_ID[keys[i]]];
                continue;
            } else {
                this.basicObjects[MASTER_CREEP_MEMORY_ID][keys[i]] = Game.creeps[keys[i]];
            }
        }

        keys = Object.keys(this.initializedMemory[MASTER_FLAG_MEMORY_ID]);
        for (let i = 0; i < keys.length; i++) {
            if (!Game.flags[keys[i]]) {
                // Flag gone.
                this.masterMemory[MASTER_FLAG_MEMORY_ID].DeleteChildMemory(keys[i]);
                delete this.initializedMemory[MASTER_FLAG_MEMORY_ID][keys[i]];
                delete this.basicObjects[MASTER_FLAG_MEMORY_ID[keys[i]]];
                continue;
            }
            this.basicObjects[MASTER_FLAG_MEMORY_ID][keys[i]] = Game.flags[keys[i]];
        }

        keys = Object.keys(this.initializedMemory[MASTER_ROOMOBJECT_MEMORY_ID]);
        for (let i = 0; i < keys.length; i++) {
            if (!Game.getObjectById(keys[i])) {
                // Roomobject gone.  Could be in a different room.
                this.masterMemory[MASTER_ROOMOBJECT_MEMORY_ID].DeleteChildMemory(keys[i]);
                delete this.initializedMemory[MASTER_ROOMOBJECT_MEMORY_ID][keys[i]];
                delete this.basicObjects[MASTER_ROOMOBJECT_MEMORY_ID[keys[i]]];
                continue;
            }
            this.basicObjects[MASTER_ROOMOBJECT_MEMORY_ID][keys[i]] = Game.getObjectById(keys[i]) as RoomObject;
        }

        keys = Object.keys(this.initializedMemory[MASTER_STRUCTURE_MEMORY_ID]);
        for (let i = 0; i < keys.length; i++) {
            if (!Game.getObjectById(keys[i])) {
                // Structure gone.  Could be in a different room.
                this.masterMemory[MASTER_STRUCTURE_MEMORY_ID].DeleteChildMemory(keys[i]);
                delete this.initializedMemory[MASTER_STRUCTURE_MEMORY_ID][keys[i]];
                delete this.basicObjects[MASTER_STRUCTURE_MEMORY_ID[keys[i]]];
                continue;
            }
            this.basicObjects[MASTER_STRUCTURE_MEMORY_ID][keys[i]] = Game.getObjectById(keys[i]) as Structure;
        }
    }

    private static CollectObjects(objectList: string[], retreivalFunction: (id: string) => SwarmObjectType) {
        for (let i = 0; i < objectList.length; i++) {
            let obj;
            switch (type) {
                case (MASTER_CONSUL_MEMORY_ID):
                    obj = new ConsulObject(this.initializedMemory[MASTER_CONSUL_MEMORY_ID][objectList[i]].SUB_TYPE as ConsulType);
                    break;
                case (MASTER_CREEP_MEMORY_ID):
                    obj = Game.creeps[objectList[i]];
                    break;
                case (MASTER_FLAG_MEMORY_ID):
                    obj = Game.flags[objectList[i]];
                    break;
                case (MASTER_ROOM_MEMORY_ID):
                    obj = Game.rooms[objectList[i]];
                    break;
                case (MASTER_ROOMOBJECT_MEMORY_ID):
                case (MASTER_STRUCTURE_MEMORY_ID):
                default:
                    obj = Game.getObjectById(objectList[i]);
            }

            if (obj) {
                this.initializedMemory[type][objectList[i]] =
                    new MemoryBase(this.masterMemory[type][objectList[i]]);
                this.basicObjects[type][objectList[i]] =
                    SwarmCreator.CreateSwarmObject(obj, this.initializedMemory[type][objectList[i]]);
            } else {
                // Object not found, what do?
                if (type != MASTER_ROOM_MEMORY_ID) {
                    delete this.initializedMemory[type][objectList[i]];
                    this.masterMemory[type].DeleteChildMemory(objectList[i]);
                }
            }
        }
    }

    static RunTick() {

    }
    static SaveTick() {

    }
}

/**
 *
            let obj;
            switch (masterID) {
                case (MASTER_CONSUL_MEMORY_ID):
                    obj = new ConsulObject(this.initializedMemory[MASTER_CONSUL_MEMORY_ID][keys[i]].SUB_TYPE as ConsulType);
                    break;
                case (MASTER_CREEP_MEMORY_ID):
                    obj = Game.creeps[keys[i]];
                    break;
                case (MASTER_FLAG_MEMORY_ID):
                    obj = Game.flags[keys[i]];
                    break;
                case (MASTER_ROOM_MEMORY_ID):
                    obj = Game.rooms[keys[i]];
                    break;
                case (MASTER_ROOMOBJECT_MEMORY_ID):
                case (MASTER_STRUCTURE_MEMORY_ID):
                default:
                    obj = Game.getObjectById(keys[i]);
            }

            if (obj) {
                this.initializedMemory[masterID][keys[i]] =
                    new MemoryBase(this.masterMemory[masterID][keys[i]]);
                this.swarmObjects[masterID][keys[i]] =
                    SwarmCreator.CreateSwarmObject(obj, this.initializedMemory[masterID][keys[i]]);
            } else {
                // Object not found, what do?
                if (masterID != MASTER_ROOM_MEMORY_ID) {
                    delete this.initializedMemory[masterID][keys[i]];
                    this.masterMemory[masterID].DeleteChildMemory(keys[i]);
                }
            }
 */