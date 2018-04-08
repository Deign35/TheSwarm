import { SwarmMemoryWithSpecifiedData } from "SwarmMemory/SwarmMemory";

export abstract class MasterMemoryBase<T extends SwarmDataType>
    extends SwarmMemoryWithSpecifiedData<IMasterData<T>> implements IMasterData<T> {
    get isActive(): true { return true; }
    get ChildData(): { [id: string]: T; } { return this.cache.ChildData; }
    get MEM_TYPE(): SwarmDataType.Master { return SwarmDataType.Master; }
    get SWARM_TYPE(): SwarmType.SwarmMaster { return SwarmType.SwarmMaster; }
    abstract get SUB_TYPE(): T;

    GetMemoryIDs() { return Object.keys(this.ChildData); }
}

/*export abstract class MasterSwarmMemory extends
    MasterMemoryBase<SwarmDataType.Master, SwarmType.SwarmMaster, SwarmDataType>
    implements IMasterData<SwarmDataType> {
    get isActive() { return true; }
    get ChildData() {
        return this.cache.ChildData
    }
    GetMemoryIDs() { return Object.keys(this.ChildData); }
    HasMemory(id: string) { return !!this.ChildData[id]; }
    CheckoutMemory(id: string) {
        let data = this.ChildData[id];
        let newMem = SwarmCreator.CreateSwarmMemory(data as IData<T, SwarmSubType>);
        return newMem;
    }
    SaveMemory(childData: MemObject): void {
        this.ChildData[childData.id] = childData.ReleaseMemory() as IData<T, SwarmSubType>;
    }
    DeleteMemory(saveID: string): void {
        if (!!this.ChildData[saveID]) {
            delete this.ChildData[saveID];
        }
    }
}*/

export class MasterConsulMemory extends MasterMemoryBase<SwarmDataType.Consul> implements IMasterConsulData {
    get SUB_TYPE(): SwarmDataType.Consul { return SwarmDataType.Consul; }

}
export class MasterCreepMemory extends MasterMemoryBase<SwarmDataType.Creep>
    implements IMasterCreepData {
    get SUB_TYPE(): SwarmDataType.Creep { return SwarmDataType.Creep; }
}

export class MasterFlagMemory extends MasterMemoryBase<SwarmDataType.Flag> implements IMasterFlagData {
    get SUB_TYPE(): SwarmDataType.Flag { return SwarmDataType.Flag; }
}

export class MasterRoomMemory extends MasterMemoryBase<SwarmDataType.Room> implements IMasterRoomData {
    get SUB_TYPE(): SwarmDataType.Room { return SwarmDataType.Room; }
}


export class MasterRoomObjectMemory extends MasterMemoryBase<SwarmDataType.RoomObject> implements IMasterRoomObjectData {
    get SUB_TYPE(): SwarmDataType.RoomObject { return SwarmDataType.RoomObject; }
}

export class MasterStructureMemory extends MasterMemoryBase<SwarmDataType.Structure> implements IMasterStructureData {
    get SUB_TYPE(): SwarmDataType.Structure { return SwarmDataType.Structure; }
}