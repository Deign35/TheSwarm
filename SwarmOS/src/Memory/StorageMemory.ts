import { profile } from "Tools/Profiler";
import { SwarmException, MemoryLockException, AlreadyExistsException } from "Tools/SwarmExceptions";
/*
function ConvertDataToMemory<T extends SwarmDataType>(id: string, data: any): IEmptyMemory<T> {
    let memCopy = CopyObject(data);
    let memoryType = memCopy[MEM_TYPE] as T;
    switch (memoryType) {
        case (SwarmDataType.Creep): return new CreepMemory(id, memCopy);
        case (SwarmDataType.Flag): return new FlagMemory(id, memCopy);
        case (SwarmDataType.Room): return new RoomMemory(id, memCopy);
        case (SwarmDataType.Structure): return new StructureMemory(id, memCopy);
        case (SwarmDataType.RoomObject): return new RoomObjectMemory(id, memCopy);
        case (SwarmDataType.Other): return new BasicMemory(id, memCopy);
    }

    return new BasicMemory(id, memCopy);
}

function CreateNewMemory(id: string, memoryType: SwarmDataType) {
    switch (memoryType) {
        case (SwarmDataType.Creep): return new CreepMemory(id);
        case (SwarmDataType.Flag): return new FlagMemory(id);
        case (SwarmDataType.Room): return new RoomMemory(id);
        case (SwarmDataType.Structure): return new StructureMemory(id);
        case (SwarmDataType.RoomObject): return new RoomObjectMemory(id);
        case (SwarmDataType.Other): return new BasicMemory(id);
    }
    return new BasicMemory(id);
}*/
@profile
export abstract class StorageMemory<T extends SwarmType, U extends SwarmDataType> implements ISwarmMemory<T, U> {
    constructor(id: string, data?: IEmptyData<U>) {
        this._id = id;
        if (data) {
            // convert data to memory here.
            this._cache = data;
        } else {
            this._cache = this.CreateEmptyData();
        }
        this._checkedOut = false;
    }
    get id() { return this._id };
    get IsCheckedOut() { return this._checkedOut };
    get MemoryType(): U { return this._cache[MEM_TYPE] as U }

    private _id: string;
    protected _cache: IEmptyData<U>
    private _checkedOut: boolean;

    protected abstract CreateEmptyData(): IEmptyData<U>;

    GetIDs() { return Object.getOwnPropertyNames(this._cache); }
    HasData(id: string): boolean {
        return !!(this._cache[id]);
    }
    GetData<Z>(id: string): Z {
        return this._cache[id];
    }
    SetData<Z>(id: string, data: Z): void {
        this._cache[id] = data;
    }
    RemoveData(id: string): void {
        delete this._cache[id];
    }
    /**
     * @throws MemoryLockException
     */
    ReserveMemory() {
        if (this._checkedOut) {
            throw new MemoryLockException(this._checkedOut, "Memory already checked out");
        }

        this._checkedOut = true;
    }

    ReleaseMemory() {
        if (!this._checkedOut) {
            throw new MemoryLockException(this._checkedOut, "Memory not checked out");
        }

        this._checkedOut = false;
        return CopyObject(this._cache);
    }
}

@profile
export class OtherMemory<T extends SwarmType> extends StorageMemory<T, any> {
    protected CreateEmptyData(): IOtherData<T> {
        return {
            MEM_TYPE: SwarmDataType.Other
        };
    }
}

@profile
export class FlagMemory extends StorageMemory<SwarmType.SwarmFlag, SwarmDataType.Flag> implements IFlagMemory {
    get MemoryType(): SwarmDataType.Flag { return SwarmDataType.Flag; }
    protected CreateEmptyData(): IFlagData {
        return {
            MEM_TYPE: SwarmDataType.Flag
        };
    }
}

@profile
export class StructureMemory<T extends SwarmStructureType> extends StorageMemory<T, SwarmDataType.Structure> implements IStructureMemory {
    protected CreateEmptyData(): IStructureData {
        return {
            MEM_TYPE: SwarmDataType.Structure
        };
    }
}

@profile
export class CreepMemory extends StorageMemory<SwarmType.SwarmCreep, SwarmDataType.Creep> implements ICreepMemory {
    protected CreateEmptyData(): ICreepData {
        return {
            MEM_TYPE: SwarmDataType.Creep
        };
    }
}

@profile
export class RoomMemory extends StorageMemory<SwarmType.SwarmRoom, SwarmDataType.Room> implements IRoomMemory {
    protected CreateEmptyData(): IRoomData {
        return {
            MEM_TYPE: SwarmDataType.Room,
            queenType: 0,
            OBJs: {
                MEM_TYPE: SwarmDataType.Master
            }
        }
    }
}

@profile
export class RoomObjectMemory extends StorageMemory<SwarmRoomObjectType, SwarmDataType.RoomObject> implements RoomObjectMemory {
    protected CreateEmptyData(): IRoomObjectData {
        return {
            MEM_TYPE: SwarmDataType.RoomObject
        };
    }
}

export class MasterSwarmMemory<T extends SwarmType, U extends SwarmDataType> extends
    StorageMemory<T, SwarmDataType.Master> implements IMasterSwarmMemory<T, U> {
    CheckoutChildMemory<V extends SwarmType>(id: string, swarmType: V): ISwarmMemory<V, U> {
        throw new Error("Method not implemented.");
    }
    SaveChildMemory(childMemory: IEmptyMemory<U>): void {
        this.SetData(childMemory.id, childMemory.ReleaseMemory());
    }
    SaveToParent(parentMemory: IMasterSwarmMemory<T, SwarmDataType.Master> | ISwarmMemoryStructure): void {
        throw new Error("Method not implemented.");
    }

    protected CreateEmptyData(): IEmptyData<SwarmDataType.Master> {
        return {
            MEM_TYPE: SwarmDataType.Master
        };
    }
}