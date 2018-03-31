import { MasterCreepMemory, MasterFlagMemory, MasterRoomMemory, MasterStructureMemory, MasterRoomObjectMemory, MasterOtherMemory, RoomObjectMemory } from "SwarmMemory/StorageMemory";
import { SwarmCreep } from "SwarmTypes/SwarmCreep";
import { SwarmRoom } from "SwarmTypes/SwarmRoom";
import { SwarmFlag } from "SwarmTypes/SwarmFlag";
import { SwarmObject, SwarmRoomObject, SwarmMineral, ObjectBase } from "SwarmTypes/SwarmTypes";
import { SwarmSource } from "SwarmTypes/SwarmSource";

const STATIC_OBJECTS = 'static_objects';
const ROOM_OBJECTS = 'room_objects';
const STRUCTURE_OBJECTS = 'structure_objects'
export class SwarmLoader {
    protected static MasterMemory: {
        [dataType: string]: IMasterMemory<MasterSwarmDataTypes, SwarmMemoryTypes>
        creeps: MasterCreepMemory,
        flags: MasterFlagMemory,
        rooms: MasterRoomMemory,
        structures: MasterStructureMemory,
        roomObjects: MasterRoomObjectMemory,
        other: MasterOtherMemory
    }
    static TheSwarm = {
        creeps: {} as { [id: string]: ISwarmCreep },
        flags: {} as { [id: string]: ISwarmFlag },
        rooms: {} as { [id: string]: ISwarmRoom },
        roomObjects: {} as { [id: string]: TSwarmRoomObject },
        structures: {} as { [id: string]: TSwarmStructure },
        other: {} as { [id: string]: IOtherObject }
    }
    static LoadTheSwarm() {
        this.MasterMemory = {
            creeps: Swarmlord.CheckoutMasterMemory(SwarmControllerDataTypes.Creeps) as MasterCreepMemory,
            flags: Swarmlord.CheckoutMasterMemory(SwarmControllerDataTypes.Flags) as MasterFlagMemory,
            other: Swarmlord.CheckoutMasterMemory(SwarmControllerDataTypes.Other) as MasterOtherMemory,
            rooms: Swarmlord.CheckoutMasterMemory(SwarmControllerDataTypes.Rooms) as MasterRoomMemory,
            roomObjects: Swarmlord.CheckoutMasterMemory(SwarmControllerDataTypes.RoomObjects) as MasterRoomObjectMemory,
            structures: Swarmlord.CheckoutMasterMemory(SwarmControllerDataTypes.Structures) as MasterStructureMemory,
        };
        this.LoadObjects(SwarmControllerDataTypes.Creeps);
        this.LoadObjects(SwarmControllerDataTypes.Flags);
        this.LoadObjects(SwarmControllerDataTypes.Rooms);
        this.LoadObjects(SwarmControllerDataTypes.RoomObjects);
        this.LoadObjects(SwarmControllerDataTypes.Structures);
        this.LoadObjects(SwarmControllerDataTypes.Other);

        global['TheSwarm'] = this.TheSwarm;
    }

    static LoadObjects<T extends Room | RoomObject>(dataType: SwarmControllerDataTypes) {
        let keys = this.MasterMemory[dataType].GetDataIDs();
        for (let i = 0; i < keys.length; i++) {
            this.LoadObject<T>(keys[i], Game.getObjectById(keys[i]) as T, dataType);
        }
    }

    static LoadObject<T extends Room | RoomObject>(saveID: string, obj: T, swarmDataType: SwarmControllerDataTypes) {
        if (!obj) {
            if (this.MasterMemory[swarmDataType].HasData(saveID) && swarmDataType != SwarmControllerDataTypes.Rooms
                && swarmDataType != SwarmControllerDataTypes.Other) {
                this.MasterMemory[swarmDataType].RemoveData(saveID);
            }
            return;
        }
        let swarmType = SwarmCreator.GetSwarmType(obj);
        let swarmObj = SwarmCreator.CreateSwarmObject(swarmType) as ObjectBase<SwarmMemoryTypes, T>;
        if (!this.MasterMemory[swarmDataType].HasData(saveID)) {
            let newMem = SwarmCreator.CreateNewSwarmMemory(saveID, swarmType);
            newMem.ReserveMemory();
            swarmObj.AssignObject(obj, newMem);
            this.MasterMemory[swarmDataType].SaveMemory(swarmObj.ReleaseMemory());
            // When this happens, queue it up for activation as it was not default added (if swarmObj.isActive)
        }

        let objMem = this.MasterMemory[swarmDataType].CheckoutMemory(saveID);
        swarmObj.AssignObject(obj, objMem);

        this.TheSwarm[swarmDataType][saveID] = swarmObj;
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

        Swarmlord.SaveMasterMemory(this.MasterMemory[dataType] as MasterMemoryTypes);
    }
}