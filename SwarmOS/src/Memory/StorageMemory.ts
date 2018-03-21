import { profile } from "Tools/Profiler";
import { SwarmException, MemoryLockException, AlreadyExistsException } from "Tools/SwarmExceptions";

declare interface MemoryInitializationObj {
    memType: number;
}
export abstract class MemoryBase<T extends number, U extends IData> implements IMemory<U> {
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
            MEM_TYPE: initObj.memType
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


declare type SwarmMemoryInitObject<T extends SwarmType> = MemoryInitializationObj & {
    swarmType: T
}
@profile
export abstract class SwarmMemory<T extends SwarmDataType, U extends SwarmType, V extends ISwarmData<T, U>> extends MemoryBase<T, V> {
    protected InitMemory(id: string, initObj: SwarmMemoryInitObject<U>): V {
        let memObj = super.InitMemory(id, initObj)
        memObj.SWARM_TYPE = initObj.swarmType;
        return memObj;
    }
}

@profile
export class OtherMemory<T extends SwarmType, U extends ISwarmData<SwarmDataType.Other, T>>
    extends SwarmMemory<SwarmDataType.Other, T, U> { }

@profile
export class FlagMemory extends MemoryBase<SwarmType.SwarmFlag, TFlagData> implements IFlagMemory { }

@profile
export class StructureMemory<T extends SwarmStructureType> extends
    MemoryBase<T, TStructureData> implements IStructureMemory {
}

@profile
export class CreepMemory extends MemoryBase<SwarmType.SwarmCreep, TCreepData> implements ICreepMemory { }

declare type RoomMemoryInitObj = SwarmMemoryInitObject<SwarmType.SwarmRoom> & {

}
@profile
export class RoomMemory extends MemoryBase<SwarmType.SwarmRoom, TRoomData> implements IRoomMemory { }

@profile
export class RoomObjectMemory extends MemoryBase<SwarmRoomObjectType, TRoomObjectData> implements RoomObjectMemory { }

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