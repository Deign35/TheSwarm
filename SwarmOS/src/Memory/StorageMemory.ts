import { profile } from "Tools/Profiler";
import { SwarmException, MemoryLockException, AlreadyExistsException } from "Tools/SwarmExceptions";

declare interface MemoryInitializationObj {
    GetMemType(): number;
}
export abstract class MemoryBase<T extends number, U extends IData<T>> implements IMemory<U> {
    constructor(id: string, data: U)
    constructor(id: string, data: false, initObj: MemoryInitializationObj)
    constructor(id: string, data?: U | false, initObj?: MemoryInitializationObj) {
        this._id = id;
        if (data) {
            // convert data to memory here.
            this._cache = data;
        } else {
            this._cache = this.InitMemory(id, initObj!);
            //this._cache = this.CreateEmptyData(id, this.MemoryType);
        }
    }
    get id() { return this._cache.id; };
    get IsCheckedOut() { return this._checkedOut };
    //get MemoryType() { return this._cache.MEM_TYPE };
    protected InitMemory(id: string, initObj: MemoryInitializationObj): U {
        return {
            id: id,
            MEM_TYPE: initObj.GetMemType()
        } as U
    }
    private _id!: string;
    private _cache!: U
    private _checkedOut!: boolean;

    GetDataIDs() { return Object.keys(this._cache); }
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
    ReserveMemory() {
        if (this._checkedOut) {
            throw new MemoryLockException(this._checkedOut, "Memory already checked out");
        }

        this._checkedOut = true;
    }

    ReleaseMemory(): U {
        if (!this._checkedOut) {
            throw new MemoryLockException(this._checkedOut, "Memory not checked out");
        }

        this._checkedOut = false;
        return CopyObject(this._cache);
    }
}


@profile
export abstract class SwarmMemory<T extends SwarmDataType, U extends ISwarmData<T, V>,
    V extends SwarmType, X extends ISwarmObject<V, Room | RoomObject>> extends MemoryBase<T, U> {
    protected abstract GetDataType(): T;
    protected abstract GetSwarmType(initObj: X): V;
    protected InitMemory(id: string, initObj: X) {
        let dataType = this.GetDataType();
        return {
            id: id,
            MEM_TYPE: dataType,
            SWARM_TYPE: swarmType
        } as U;
    }
}

@profile
export class OtherMemory<T extends SwarmType> extends SwarmMemory<SwarmDataType.Other, any, T> {
    protected InitMemory(id: string) {
        return {
            id: id,
            SWARM_TYPE: swarmType,
            MEM_TYPE: SwarmDataType.Other
        };
    }
}

@profile
export class FlagMemory extends MemoryBase<SwarmDataType.Flag> implements IFlagMemory {
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

    protected CreateEmptyData(): IData<SwarmDataType.Master> {
        return {
            MEM_TYPE: SwarmDataType.Master
        };
    }
}