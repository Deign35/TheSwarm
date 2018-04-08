import { SwarmMemoryWithSpecifiedData, MasterableSwarmMemory, SwarmMemory } from "SwarmMemory/SwarmMemory";
import { CreepMemory } from "./CreepMemory";
import { RoomObjectMemory } from "./RoomObjectMemory";
import { StructureMemory } from "./StructureMemory";
import { FlagMemory } from "./FlagMemory";
import { RoomMemory } from "./RoomMemory";
import { ConsulMemory } from "./ConsulMemory";


export type SwarmMemoryTypes = ConsulMemory | CreepMemory | FlagMemory | RoomMemory | RoomObjectMemory | StructureMemory

export abstract class MasterMemoryBase<T extends SwarmDataType,
    U extends IMasterData<T>, V extends ISwarmData<T, SwarmType, SwarmSubType>>
    extends SwarmMemoryWithSpecifiedData<U> implements IMasterData<T> {
    constructor(data: U) {
        super(data);
    }
    get isActive(): true { return true; }
    get ChildData(): { [id: string]: V } { return this.cache.ChildData as { [id: string]: V }; }
    get MEM_TYPE(): SwarmDataType.Master { return SwarmDataType.Master; }
    get SWARM_TYPE(): SwarmType.SwarmMaster { return SwarmType.SwarmMaster; }
    abstract get SUB_TYPE(): T;

    GetMemoryIDs() { return Object.keys(this.ChildData); }
    HasMemory(id: string) { return !!this.ChildData[id]; }
    CheckoutMemory(id: string) {
        let data = this.ChildData[id];
        let newMem = SwarmCreator.CreateSwarmMemory(data) as SwarmMemory;

        newMem.ReserveMemory();
        return newMem;
    }
    SaveMemory(childData: SwarmMemory): void {
        this.ChildData[childData.id] = childData.ReleaseMemory() as V;
    }
    DeleteMemory(saveID: string): void {
        if (!!this.ChildData[saveID]) {
            delete this.ChildData[saveID];
        }
    }
}
abstract class MasterMemoryWithSpecifiedData<T extends MasterSwarmDataTypes>
    extends MasterMemoryBase<SwarmDataType, T, ISwarmData<SwarmDataType, SwarmType, SwarmSubType>> {

}

export class MasterConsulMemory extends MasterMemoryWithSpecifiedData<IMasterConsulData> implements IMasterConsulData {
    get ChildData(): { [id: string]: ISwarmData<SwarmDataType.Consul, SwarmType, SwarmSubType>; } {
        return super.ChildData as { [id: string]: ISwarmData<SwarmDataType.Consul, SwarmType, SwarmSubType> };
    }
    get SUB_TYPE(): SwarmDataType.Consul { return SwarmDataType.Consul; }

}
export class MasterCreepMemory extends MasterMemoryWithSpecifiedData<IMasterCreepData> implements IMasterCreepData {
    get ChildData(): { [id: string]: ISwarmData<SwarmDataType.Creep, SwarmType, SwarmSubType>; } {
        return super.ChildData as { [id: string]: ISwarmData<SwarmDataType.Creep, SwarmType, SwarmSubType> };
    }
    get SUB_TYPE(): SwarmDataType.Creep { return SwarmDataType.Creep; }
}

export class MasterFlagMemory extends MasterMemoryWithSpecifiedData<IMasterFlagData> implements IMasterFlagData {
    get ChildData(): { [id: string]: ISwarmData<SwarmDataType.Flag, SwarmType, SwarmSubType>; } {
        return super.ChildData as { [id: string]: ISwarmData<SwarmDataType.Flag, SwarmType, SwarmSubType> };
    }
    get SUB_TYPE(): SwarmDataType.Flag { return SwarmDataType.Flag; }
}

export class MasterRoomMemory extends MasterMemoryWithSpecifiedData<IMasterRoomData> implements IMasterRoomData {
    get ChildData(): { [id: string]: ISwarmData<SwarmDataType.Room, SwarmType, SwarmSubType>; } {
        return super.ChildData as { [id: string]: ISwarmData<SwarmDataType.Room, SwarmType, SwarmSubType> };
    }
    get SUB_TYPE(): SwarmDataType.Room { return SwarmDataType.Room; }
}


export class MasterRoomObjectMemory extends MasterMemoryWithSpecifiedData<IMasterRoomObjectData>
    implements IMasterRoomObjectData {
    get ChildData(): { [id: string]: ISwarmData<SwarmDataType.RoomObject, SwarmType, SwarmSubType>; } {
        return super.ChildData as { [id: string]: ISwarmData<SwarmDataType.RoomObject, SwarmType, SwarmSubType> };
    }
    get SUB_TYPE(): SwarmDataType.RoomObject { return SwarmDataType.RoomObject; }
}

export class MasterStructureMemory extends MasterMemoryWithSpecifiedData<IMasterStructureData>
    implements IMasterStructureData {
    get ChildData(): { [id: string]: ISwarmData<SwarmDataType.Structure, SwarmType, SwarmSubType>; } {
        return super.ChildData as { [id: string]: ISwarmData<SwarmDataType.Structure, SwarmType, SwarmSubType> };
    }
    get SUB_TYPE(): SwarmDataType.Structure { return SwarmDataType.Structure; }
}

export type MasterMemory = MasterMemoryWithSpecifiedData<MasterSwarmDataTypes>;