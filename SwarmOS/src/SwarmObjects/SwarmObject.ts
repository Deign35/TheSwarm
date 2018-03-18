import { RoomObjectMemory, RoomMemory, StorageMemory } from "Memory/StorageMemory";

abstract class SwarmItem<T> implements ISwarmItem<T> {
    constructor(instance: T, parentPath: string[]) {
        this._instance = instance;
        this.Init(parentPath);
    }
    protected _instance: T;
    protected _memory!: IStorageMemory<SwarmData>;
    protected Init(parentPath: string[]) {
        this._memory = Swarmlord.CheckoutMemory(this.saveID, parentPath, this.storageMemoryType);
    }
    get value() { return this._instance; }
    abstract get saveID(): string;
    abstract get swarmType(): SwarmType;
    abstract get storageMemoryType(): StorageMemoryType
    Activate() { }
    GetMemoryObject() { return this._memory; }
}

export abstract class SwarmItemWithName<T extends Room | Flag> extends SwarmItem<T> {
    get name() { return this._instance.name }
}

export abstract class SwarmObject<T extends Source | Creep | Structure | Mineral | Resource |
    ConstructionSite | Nuke | Tombstone> extends SwarmItem<T> implements ISwarmObject<T> {
    get pos() { return this._instance.pos; }
    get room() { return this._instance.room; } // This should get the room object i created.
    get id() { return this._instance.id; }
    get prototype(): T { return this._instance.prototype as T; }
    get saveID() { return this._instance.id; }
}

export class SwarmTombstone extends SwarmObject<Tombstone> implements ISwarmTombstone, Tombstone {
    get storageMemoryType() { return StorageMemoryType.RoomObject; }
    get swarmType(): SwarmType.SwarmTombstone { return SwarmType.SwarmTombstone }
    get creep() { return this._instance.creep; }
    get deathTime() { return this._instance.deathTime; }
    get store() { return this._instance.store; }
    get ticksToDecay() { return this._instance.ticksToDecay; }
}
export function MakeSwarmTombstone(tombStone: Tombstone, parentPath: string[]): TSwarmTombstone {
    return new SwarmTombstone(tombStone, parentPath);
}

export abstract class NotifiableSwarmObject<T extends Creep | Structure | ConstructionSite>
    extends SwarmObject<T> implements INotifiableSwarmObject<T> {
    notifyWhenAttacked(enabled: boolean = false) { // ActionIntent
        if ((this._instance as Structure).notifyWhenAttacked) {
            // Using this to trick the compiler into letting me return the value because apparently,
            // it doesn't like generic ScreepsReturnCode as a return despite the typings.
            return (this._instance as Structure).notifyWhenAttacked(enabled) as OK;
        }
        return OK;
    }
}

export abstract class OwnableSwarmObject<T extends Creep | OwnedStructure | ConstructionSite>
    extends NotifiableSwarmObject<T> implements IOwnableSwarmObject<T> {
    get my() { return this._instance.my; }
    get owner() { return this._instance.owner; }
}

export class SwarmMineral extends SwarmObject<Mineral> implements ISwarmMineral, Mineral {
    get storageMemoryType() { return StorageMemoryType.RoomObject; }
    get swarmType(): SwarmType.SwarmMineral { return SwarmType.SwarmMineral; }
    get density() { return this._instance.density; }
    get mineralAmount() { return this._instance.mineralAmount; }
    get mineralType() { return this._instance.mineralType; }
    get ticksToRegeneration() { return this._instance.ticksToRegeneration; }
}
export function MakeSwarmMineral(mineral: Mineral, parentPath: string[]): TSwarmMineral {
    return new SwarmMineral(mineral, parentPath);
}

export class SwarmResource extends SwarmObject<Resource> implements ISwarmResource, Resource {
    get storageMemoryType() { return StorageMemoryType.RoomObject; }
    get swarmType(): SwarmType.SwarmResource { return SwarmType.SwarmResource; }
    get amount() { return this._instance.amount; }
    get resourceType() { return this._instance.resourceType; }
}
export function MakeSwarmResource(resource: Resource, parentPath: string[]): TSwarmResource {
    return new SwarmResource(resource, parentPath);
}

export class SwarmNuke extends SwarmObject<Nuke> implements ISwarmNuke, Nuke {
    get storageMemoryType() { return StorageMemoryType.RoomObject; }
    get swarmType(): SwarmType.SwarmNuke { return SwarmType.SwarmNuke; }
    get launchRoomName() { return this._instance.launchRoomName; }
    get timeToLand() { return this._instance.timeToLand; }
}
export function MakeSwarmNuke(nuke: Nuke, parentPath: string[]): TSwarmNuke {
    return new SwarmNuke(nuke, parentPath);
}