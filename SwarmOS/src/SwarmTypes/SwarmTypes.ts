import { profile } from "Tools/Profiler";
import { MemoryBase, SwarmMemory } from "SwarmMemory/SwarmMemory";
import { RoomObjectMemoryBase, MineralMemory, TombstoneMemory, ResourceMemory, NukeMemory } from "SwarmMemory/RoomObjectMemory";


const HAS_PREPPED = 'hasPrepped';
@profile
export abstract class ObjectBase<T extends SwarmDataType, U extends string | number,
    V extends IData<T, U>, X extends MemoryBase<T, V>, Y extends SwarmObjectType> {
    protected OnPrepObject() {

    }
    PrepObject(prepIfInactive: boolean) {
        if ((prepIfInactive || this.IsActive) && !this.memory.GetFlashData(HAS_PREPPED)) {
            this.OnPrepObject();
            this.memory.SetFlashData(HAS_PREPPED, true);
        }
    }

    get IsActive(): boolean { return this.memory.isActive; }
    protected OnActivate() { }
    Activate(): void {
        this.PrepObject(false); // What should this actually for reactivating an object??
        if (this.IsActive) {
            this.OnActivate();
        }
    }

    abstract get prototype(): Y;
    InitAsNew() { }
    AssignObject(obj: Y, objMemory: X): void {
        this._instance = obj;
        this._memory = objMemory;
    }

    protected _instance!: Y;
    GetObjectInstance(): Y { return this._instance; }

    private _memory!: X;
    get memory(): X { return this._memory; }
    get id(): string { return this.memory.id; }

    GetMemType(): T {
        return this.memory.MEM_TYPE;
    }
}
@profile
export abstract class SwarmTypeBase<T extends SwarmDataTypeSansMaster, U extends SwarmType,
    V extends string | number, W extends ISwarmData<T, U, V>, X extends SwarmMemory<T, U, V, W>,
    Y extends SwarmObjectType> extends ObjectBase<T, V, W, X, Y> {
    get IsActive() { return this.memory.isActive; }
}

@profile
export abstract class SwarmObject_RoomObject<T extends SwarmDataTypeSansMaster, U extends SwarmType,
    V extends string | number, W extends ISwarmData<T, U, V>, X extends SwarmMemory<T, U, V, W>,
    Y extends RoomObject> extends ObjectBase<T, V, W, X, Y> implements RoomObject {
    get pos() { return this._instance.pos; }
    get room() { return this._instance.room; } // This should get the room object i created.
    get prototype(): Y { return this._instance.prototype as Y }
}

@profile
export abstract class NotifiableSwarmObject<T extends SwarmDataTypeSansMaster, U extends SwarmType,
    V extends string | number, W extends ISwarmData<T, U, V>, X extends SwarmMemory<T, U, V, W>,
    Y extends Creep | Structure> extends SwarmObject_RoomObject<T, U, V, W, X, Y>  {
    notifyWhenAttacked(enabled: boolean = false) { // ActionIntent
        if (this._instance.notifyWhenAttacked) {
            // Using this to trick the compiler into letting me return the value because apparently,
            // it doesn't like generic ScreepsReturnCode as a return despite the typings.
            return this._instance.notifyWhenAttacked(enabled) as OK;
        }
        return OK;
    }
}

@profile
export abstract class OwnableSwarmObject<T extends SwarmDataTypeSansMaster, U extends SwarmType,
    V extends string | number, W extends ISwarmData<T, U, V>, X extends SwarmMemory<T, U, V, W>,
    Y extends Creep | OwnedStructure> extends NotifiableSwarmObject<T, U, V, W, X, Y> {
    get my() { return this._instance.my; }
    get owner() { return this._instance.owner; }
}
@profile
export abstract class SwarmRoomObject<T extends SwarmRoomObjectType,
    U extends IRoomObjectData<T>, V extends RoomObjectMemoryBase<T, U>,
    X extends Mineral | Resource | Tombstone | Nuke | ConstructionSite | Source>
    extends SwarmObject_RoomObject<SwarmDataType.RoomObject, T, T, U, V, X> {
    get room(): Room { return this._instance.room! }
}

@profile
export class SwarmMineral extends SwarmRoomObject<SwarmType.SwarmMineral, IMineralData, MineralMemory, Mineral>
    implements Mineral {
    get SwarmType(): SwarmType.SwarmMineral { return SwarmType.SwarmMineral; }
    get density() { return this._instance.density; }
    get mineralAmount() { return this._instance.mineralAmount; }
    get mineralType() { return this._instance.mineralType; }
    get ticksToRegeneration() { return this._instance.ticksToRegeneration; }
}

@profile
export class SwarmTombstone extends SwarmRoomObject<SwarmType.SwarmTombstone, ITombstoneData,
TombstoneMemory, Tombstone> implements Tombstone {
    get SwarmType(): SwarmType.SwarmTombstone { return SwarmType.SwarmTombstone }
    get creep() { return this._instance.creep; }
    get deathTime() { return this._instance.deathTime; }
    get store() { return this._instance.store; }
    get ticksToDecay() { return this._instance.ticksToDecay; }
}

@profile
export class SwarmResource extends SwarmRoomObject<SwarmType.SwarmResource, IResourceData,
ResourceMemory, Resource> implements Resource {
    get storageMemoryType() { return SwarmDataType.RoomObject; }
    get SwarmType(): SwarmType.SwarmResource { return SwarmType.SwarmResource; }
    get amount() { return this._instance.amount; }
    get resourceType() { return this._instance.resourceType; }
}

@profile
export class SwarmNuke extends SwarmRoomObject<SwarmType.SwarmNuke, INukeData, NukeMemory, Nuke> implements Nuke {
    get storageMemoryType() { return SwarmDataType.RoomObject; }
    get SwarmType(): SwarmType.SwarmNuke { return SwarmType.SwarmNuke; }
    get launchRoomName() { return this._instance.launchRoomName; }
    get timeToLand() { return this._instance.timeToLand; }
}

