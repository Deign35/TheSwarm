import { MemoryBase, RoomMemory, FlagMemory, SwarmMemoryTypes, CreepMemory, StructureMemory, RoomObjectMemory, TStructureMemory, TRoomObjectMemory } from "SwarmMemory/SwarmMemory";
import { InvalidArgumentException } from "Tools/SwarmExceptions";

export abstract class ObjectBase<T extends SwarmMemoryTypes, U> {
    constructor() {
    }

    PrepObject() {

    }
    abstract get IsActive(): boolean;
    protected abstract OnActivate(): void;
    Activate(): void {
        if (this.IsActive) {
            this.OnActivate();
        }
    }

    abstract get prototype(): U;
    InitAsNew() { }
    AssignObject(obj: U, objMemory: T): void {
        this._instance = obj;
        this._memory = objMemory;
    }

    protected _instance!: U;
    GetObjectInstance(): U { return this._instance; }

    get memory(): T { return this._memory; }
    protected _memory!: T;
    get saveID(): string { return this._memory.id; }
    ReleaseMemory(): T { return this._memory; }
    GetMemType() {
        if (this._memory) {
            return this._memory.MEM_TYPE;
        }
        return SwarmDataType.None;
    }
    GetSwarmType() {
        if (this._memory) {
            return this._memory.SWARM_TYPE;
        }

        return SwarmType.Any;
    }
}
export abstract class SwarmTypeBase<T extends SwarmMemoryTypes, U extends Room | RoomObject | Creep | Flag | Structure<StructureConstant>>
    extends ObjectBase<T, U> {
    get IsActive() { return this._memory.isActive; }
    get prototype(): U { return this._instance.prototype as U }
}

export abstract class SwarmItemWithName<U extends Room | Flag> extends SwarmTypeBase<FlagMemory | RoomMemory, U> {
    get name() { return this._instance.name }
    get saveID() { return this.name; }
}

export abstract class SwarmObject<T extends SwarmMemoryTypes, U extends RoomObject> extends SwarmTypeBase<T, U> {
    get pos() { return this._instance.pos; }
    get room() { return this._instance.room; } // This should get the room object i created.
}
export abstract class SwarmObjectWithID<T extends SwarmMemoryTypes,
    U extends Source | Creep | Structure | Mineral | Resource | ConstructionSite | Nuke | Tombstone>
    extends SwarmObject<T, U> {
    get id() { return this._instance.id; }
    get saveID() { return this.id; }
}

export abstract class NotifiableSwarmObject<T extends Creep | Structure, U extends CreepMemory | TStructureMemory>
    extends SwarmObjectWithID<U, T> {
    notifyWhenAttacked(enabled: boolean = false) { // ActionIntent
        if ((this._instance as Structure).notifyWhenAttacked) {
            // Using this to trick the compiler into letting me return the value because apparently,
            // it doesn't like generic ScreepsReturnCode as a return despite the typings.
            return (this._instance as Structure).notifyWhenAttacked(enabled) as OK;
        }
        return OK;
    }
}

export abstract class OwnableSwarmObject<T extends Creep | OwnedStructure, U extends CreepMemory | TStructureMemory>
    extends NotifiableSwarmObject<T, U> {
    get my() { return this._instance.my; }
    get owner() { return this._instance.owner; }
}
export abstract class SwarmRoomObject<T extends Mineral | Resource | Tombstone | Nuke | ConstructionSite | Source, U extends TRoomObjectMemory>
    extends SwarmObjectWithID<U, T> {
    get DataType(): SwarmDataType.RoomObject { return SwarmDataType.RoomObject }
    get room(): Room { return this._instance.room! }
}

export class SwarmMineral extends SwarmRoomObject<Mineral, RoomObjectMemory<IMineralData, SwarmType.SwarmMineral>> implements Mineral {
    get SwarmType(): SwarmType.SwarmMineral { return SwarmType.SwarmMineral; }
    get density() { return this._instance.density; }
    get mineralAmount() { return this._instance.mineralAmount; }
    get mineralType() { return this._instance.mineralType; }
    get ticksToRegeneration() { return this._instance.ticksToRegeneration; }
    protected OnActivate() {
        console.log("Successfully activated a Mineral");
    }
}

export class SwarmTombstone extends SwarmRoomObject<Tombstone,
    RoomObjectMemory<IRoomObjectData<SwarmType.SwarmTombstone>, SwarmType.SwarmTombstone>> implements Tombstone {
    get SwarmType(): SwarmType.SwarmTombstone { return SwarmType.SwarmTombstone }
    get creep() { return this._instance.creep; }
    get deathTime() { return this._instance.deathTime; }
    get store() { return this._instance.store; }
    get ticksToDecay() { return this._instance.ticksToDecay; }
    protected OnActivate() {
        console.log("Successfully activated a Tombstone");
    }
}

export class SwarmResource extends SwarmRoomObject<Resource,
    RoomObjectMemory<IRoomObjectData<SwarmType.SwarmResource>, SwarmType.SwarmResource>> implements Resource {
    get storageMemoryType() { return SwarmDataType.RoomObject; }
    get SwarmType(): SwarmType.SwarmResource { return SwarmType.SwarmResource; }
    get amount() { return this._instance.amount; }
    get resourceType() { return this._instance.resourceType; }
    protected OnActivate() {
        console.log("Successfully activated a Resource");
    }
}

export class SwarmNuke extends SwarmRoomObject<Nuke,
    RoomObjectMemory<IRoomObjectData<SwarmType.SwarmNuke>, SwarmType.SwarmNuke>> implements Nuke {
    get storageMemoryType() { return SwarmDataType.RoomObject; }
    get SwarmType(): SwarmType.SwarmNuke { return SwarmType.SwarmNuke; }
    get launchRoomName() { return this._instance.launchRoomName; }
    get timeToLand() { return this._instance.timeToLand; }
    protected OnActivate() {
        console.log("Successfully activated a Nuke");
    }
}

