import { profile } from "Tools/Profiler";
import { SwarmException, MemoryLockException, AlreadyExistsException } from "Tools/SwarmExceptions";

declare interface MemoryInitializationObj {
    memType: number;
}
export abstract class MemoryBase<T extends number, U extends IData> implements IMemory<U> {
    constructor(data: U) {
        this._id = data.id;
        this._cache = data || {};
    }
    get id() { return this._cache.id; };
    get IsCheckedOut() { return this._checkedOut };
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
    MemoryBase<T, TStructureData> implements IStructureMemory { }

@profile
export class CreepMemory extends MemoryBase<SwarmType.SwarmCreep, TCreepData> implements ICreepMemory { }

declare type RoomMemoryInitObj = SwarmMemoryInitObject<SwarmType.SwarmRoom> & {}
@profile
export class RoomMemory extends MemoryBase<SwarmType.SwarmRoom, TRoomData> implements IRoomMemory { }

@profile
export class RoomObjectMemory extends MemoryBase<SwarmRoomObjectType, TRoomObjectData> implements RoomObjectMemory { }
/**declare interface IMasterMemory<T extends TMasterData> extends IMemory<T> {
    CheckoutChildMemory(id: string): IMemory<T>
    SaveChildMemory(childMemory: T): void;
    SaveToParent(parentMemory: TMasterMemory | ISwarmMemoryStructure): void;
} declare type TMasterMemory = IMasterMemory<TMasterData>;
 */
export class MasterSwarmMemory<T extends SwarmType, U extends TSwarmData, V extends IMasterData<U>>
    extends MemoryBase<T, V> implements IMasterMemory<T, U, V> {
    constructor(data: V) {
        super(data);
        this.ChildData = this.GetData("ChildData");
    }
    get MEM_TYPE(): SwarmDataType.Master { return SwarmDataType.Master };
    protected ChildData!: { [id: string]: U; }
    CheckoutChildMemory(id: string): IMemory<U> {
        let data = this.ChildData[id];
        let newMem = SwarmCreator.CreateSwarmMemory(data);

        newMem.ReserveMemory();
        return newMem as IMemory<U>;
        //create memory from the data in ID and return the memory.
    }
    SaveChildMemory(childData: U): void {
        this.ChildData[childData.id] = childData;
    }
    SaveToParent(parentMemory: TMasterMemory | ISwarmMemoryStructure): void {
        if ((parentMemory as TMemory).IsCheckedOut) {
            this.SetData('ChildData', this.ChildData);
            (parentMemory as TMasterMemory).SaveChildMemory(this);
        } else {
            parentMemory[this.id] = this.ReleaseMemory();
        }
    }
}


export class MasterCreepMemory extends MasterSwarmMemory<SwarmType.SwarmCreep, TCreepData, IMasterCreepData>
    implements IMasterCreepMemory {

}
export class MasterFlagMemory extends MasterSwarmMemory<SwarmType.SwarmFlag, TFlagData, IMasterFlagData>
    implements IMasterFlagMemory {

}
export class MasterRoomMemory extends MasterSwarmMemory<SwarmType.SwarmRoom, TRoomData, IMasterRoomData>
    implements IMasterRoomMemory {

}
export class MasterStructureMemory extends MasterSwarmMemory<SwarmStructureType, TStructureData, IMasterStructureData>
    implements IMasterStructureMemory {

}