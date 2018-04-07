import { profile } from "Tools/Profiler";
import { MemoryBase, SwarmMemory } from "SwarmMemory/SwarmMemory";
import { RoomObjectMemoryBase, MineralMemory, TombstoneMemory, ResourceMemory, NukeMemory } from "SwarmMemory/RoomObjectMemory";
import { ConsulObject } from "Consuls/ConsulBase";
import { TSwarmObject_1 } from "SwarmTypes/SwarmCreator";


const HAS_PREPPED = 'hasPrepped';
@profile
export abstract class ObjectBase<T extends SwarmDataType, U extends string | number,
    V extends IData<T, U>, W extends MemoryBase<T, U, V>, X extends any> {
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
    InitAsNew() { }
    AssignObject(obj: X, objMemory: W): void {
        this._instance = obj;
        this.memory = objMemory;
    }

    protected _instance!: X;
    GetObjectInstance(): X { return this._instance; }
    protected abstract memory: W;
    get id(): string { return this.memory.id; }

    GetMemType(): T {
        return this.memory.MEM_TYPE;
    }
}
@profile
export class SwarmTypeBase<T extends SwarmDataTypeSansMaster, U extends SwarmType,
    V extends string | number, W extends SwarmMemory<T, U, V>, Y extends SwarmObjectType>
    extends ObjectBase<T, V, ISwarmData<T, U, V>, W, Y> implements TSwarmObject_1<T, U, V, Y> {
    private _memory!: W;
    get memory() { return this._memory; }
    set memory(mem: W) { this._memory = mem; }

    get SWARM_TYPE(): U { return this.memory.SWARM_TYPE; }
    get IsActive() { return this.memory.isActive; }
}

@profile
export abstract class SwarmObject_RoomObject<T extends SwarmDataTypeSansMaster, U extends SwarmType,
    V extends string | number, W extends SwarmMemory<T, U, V>, Y extends RoomObject>
    extends SwarmTypeBase<T, U, V, W, Y> implements RoomObject {
    get pos() { return this._instance.pos; }
    get room() { return this._instance.room; } // This should get the room object i created.
    get prototype(): Y { return this._instance.prototype as Y }
}

@profile
export abstract class NotifiableSwarmObject<T extends SwarmDataTypeSansMaster, U extends SwarmType,
    V extends string | number, W extends SwarmMemory<T, U, V>, Y extends Creep | Structure>
    extends SwarmObject_RoomObject<T, U, V, W, Y>  {
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
    V extends string | number, W extends SwarmMemory<T, U, V>,
    Y extends Creep | OwnedStructure> extends NotifiableSwarmObject<T, U, V, W, Y> {
    get my() { return this._instance.my; }
    get owner() { return this._instance.owner; }
}
@profile
export abstract class SwarmRoomObject<T extends SwarmRoomObjectType, U extends RoomObjectMemoryBase<T>,
    X extends Mineral | Resource | Tombstone | Nuke | ConstructionSite | Source>
    extends SwarmObject_RoomObject<SwarmDataType.RoomObject, T, T, U, X> {
    get room(): Room { return this._instance.room! }
}

@profile
export class SwarmMineral extends SwarmRoomObject<SwarmType.SwarmMineral, MineralMemory, Mineral> implements Mineral {

    get SwarmType(): SwarmType.SwarmMineral { return SwarmType.SwarmMineral; }
    get density() { return this._instance.density; }
    get mineralAmount() { return this._instance.mineralAmount; }
    get mineralType() { return this._instance.mineralType; }
    get ticksToRegeneration() { return this._instance.ticksToRegeneration; }
}

@profile
export class SwarmTombstone extends SwarmRoomObject<SwarmType.SwarmTombstone,
TombstoneMemory, Tombstone> implements Tombstone {
    get SwarmType(): SwarmType.SwarmTombstone { return SwarmType.SwarmTombstone }
    get creep() { return this._instance.creep; }
    get deathTime() { return this._instance.deathTime; }
    get store() { return this._instance.store; }
    get ticksToDecay() { return this._instance.ticksToDecay; }
}

@profile
export class SwarmResource extends SwarmRoomObject<SwarmType.SwarmResource,
ResourceMemory, Resource> implements Resource {
    get storageMemoryType() { return SwarmDataType.RoomObject; }
    get SwarmType(): SwarmType.SwarmResource { return SwarmType.SwarmResource; }
    get amount() { return this._instance.amount; }
    get resourceType() { return this._instance.resourceType; }
}

@profile
export class SwarmNuke extends SwarmRoomObject<SwarmType.SwarmNuke, NukeMemory, Nuke> implements Nuke {
    get storageMemoryType() { return SwarmDataType.RoomObject; }
    get SwarmType(): SwarmType.SwarmNuke { return SwarmType.SwarmNuke; }
    get launchRoomName() { return this._instance.launchRoomName; }
    get timeToLand() { return this._instance.timeToLand; }
}

