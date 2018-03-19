import { RoomObjectMemory, RoomMemory, StorageMemory } from "Memory/StorageMemory";

abstract class SwarmObj<T extends SwarmType, U extends RoomObject | Room, V extends SwarmDataType> implements ISwarmObj<T, U, V>, _Constructor<U>  {
    get prototype(): U {
        return this._instance.prototype as U;

    }
    get IsActive(): boolean {
        return false;
    }
    Activate(): void {
        if (this.IsActive) {
            this.OnActivate();
        }
    }
    constructor(instance: U) {
        this._instance = instance;
    }
    protected _instance: U;
    protected _memory!: IEmptyMemory<V>;
    get value() { return this._instance; }
    abstract get saveID(): string;
    abstract get swarmType(): T;
    abstract get memType(): V
    protected abstract OnActivate(): void;
    GetMemoryObject(): IEmptyMemory<V> { return this._memory; }
    AssignMemory(mem: IEmptyMemory<V>) {
        this._memory = mem;
    }
    InitNewObject() { }
    GetSpawnRequirements(): ISpawnRequirement {
        return SwarmObj.NoSpawnRequirement;
    }


    static readonly NoSpawnRequirement: ISpawnRequirement = {
        priority: Priority.Lowest,
        neededIn: 1500,
        minBody: [],
        growthTemplate: []
    }
}

export abstract class SwarmItemWithName<T extends SwarmType.SwarmRoom | SwarmType.SwarmFlag,
    U extends Room | Flag, V extends SwarmDataType.Room | SwarmDataType.Flag> extends SwarmObj<T, U, V> {
    get name() { return this._instance.name }
    get saveID() { return this.name; }
}

export abstract class SwarmObject<T extends SwarmType, U extends RoomObject, V extends SwarmDataType> extends SwarmObj<T, U, V> implements ISwarmObject<T, U, V> {
    get pos() { return this._instance.pos; }
    get room() { return this._instance.room!; } // This should get the room object i created.
}
export abstract class SwarmObjectWithID<T extends SwarmType, U extends Source | Creep | Structure | Mineral | Resource |
    ConstructionSite | Nuke | Tombstone, V extends SwarmDataType> extends SwarmObject<T, U, V> {
    get id() { return this._instance.id; }
    get saveID() { return this.id; }
}

export abstract class NotifiableSwarmObject<T extends SwarmType, U extends Creep | Structure,
    V extends SwarmDataType>
    extends SwarmObjectWithID<T, U, V> implements INotifiableSwarmObject<T, U, V> {
    notifyWhenAttacked(enabled: boolean = false) { // ActionIntent
        if ((this._instance as Structure).notifyWhenAttacked) {
            // Using this to trick the compiler into letting me return the value because apparently,
            // it doesn't like generic ScreepsReturnCode as a return despite the typings.
            return (this._instance as Structure).notifyWhenAttacked(enabled) as OK;
        }
        return OK;
    }
}

export abstract class OwnableSwarmObject<T extends SwarmType, U extends Creep | OwnedStructure,
    V extends SwarmDataType>
    extends NotifiableSwarmObject<T, U, V> implements IOwnableSwarmObject<T, U, V> {
    get my() { return this._instance.my; }
    get owner() { return this._instance.owner; }
}
export abstract class SwarmRoomObject<T extends SwarmType,
    U extends Mineral | Resource | Tombstone | Nuke | ConstructionSite | Source>
    extends SwarmObjectWithID<T, U, SwarmDataType.RoomObject> {
    get memType(): SwarmDataType.RoomObject { return SwarmDataType.RoomObject }
    get room(): Room { return this._instance.room! }
}

export class SwarmMineral extends SwarmRoomObject<SwarmType.SwarmMineral, Mineral> implements ISwarmMineral, Mineral {
    GetMemoryObject(): IEmptyMemory<SwarmDataType.RoomObject> {
        throw new Error("Method not implemented.");
    }
    Activate(): void {
        throw new Error("Method not implemented.");
    }
    AssignMemory(mem: IEmptyMemory<SwarmDataType.RoomObject>): void {
        throw new Error("Method not implemented.");
    }
    InitNewObject(): void {
        throw new Error("Method not implemented.");
    }
    GetSpawnRequirements(): ISpawnRequirement {
        throw new Error("Method not implemented.");
    }
    get swarmType(): SwarmType.SwarmMineral { return SwarmType.SwarmMineral; }
    get density() { return this._instance.density; }
    get mineralAmount() { return this._instance.mineralAmount; }
    get mineralType() { return this._instance.mineralType; }
    get ticksToRegeneration() { return this._instance.ticksToRegeneration; }
    protected OnActivate() {
        console.log("Successfully activated a Mineral");
    }
}
export function MakeSwarmMineral(mineral: Mineral): TSwarmMineral {
    return new SwarmMineral(mineral);
}

export class SwarmTombstone extends SwarmRoomObject<SwarmType.SwarmTombstone, Tombstone> implements ISwarmTombstone, Tombstone {
    get swarmType(): SwarmType.SwarmTombstone { return SwarmType.SwarmTombstone }
    get creep() { return this._instance.creep; }
    get deathTime() { return this._instance.deathTime; }
    get store() { return this._instance.store; }
    get ticksToDecay() { return this._instance.ticksToDecay; }
    protected OnActivate() {
        console.log("Successfully activated a Tombstone");
    }
}
export function MakeSwarmTombstone(tombStone: Tombstone): TSwarmTombstone {
    return new SwarmTombstone(tombStone);
}

export class SwarmResource extends SwarmRoomObject<SwarmType.SwarmResource, Resource> implements ISwarmResource, Resource {
    get storageMemoryType() { return SwarmDataType.RoomObject; }
    get swarmType(): SwarmType.SwarmResource { return SwarmType.SwarmResource; }
    get amount() { return this._instance.amount; }
    get resourceType() { return this._instance.resourceType; }
    protected OnActivate() {
        console.log("Successfully activated a Resource");
    }
}
export function MakeSwarmResource(resource: Resource): TSwarmResource {
    return new SwarmResource(resource);
}

export class SwarmNuke extends SwarmRoomObject<SwarmType.SwarmNuke, Nuke> implements ISwarmNuke, Nuke {
    get storageMemoryType() { return SwarmDataType.RoomObject; }
    get swarmType(): SwarmType.SwarmNuke { return SwarmType.SwarmNuke; }
    get launchRoomName() { return this._instance.launchRoomName; }
    get timeToLand() { return this._instance.timeToLand; }
    protected OnActivate() {
        console.log("Successfully activated a Nuke");
    }
}
export function MakeSwarmNuke(nuke: Nuke): TSwarmNuke {
    return new SwarmNuke(nuke);
}