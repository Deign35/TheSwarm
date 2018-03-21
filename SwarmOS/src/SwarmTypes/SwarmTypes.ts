abstract class SwarmTypeBase<T extends SwarmType, U extends SwarmDataType, V extends RoomObject | Room> implements ISwarmObject<T, U, V> {
    get prototype(): V {
        return this.prototype;
    }
    get IsActive(): boolean {
        return false;
    }
    Activate(): void {
        if (this.IsActive) {
            this.OnActivate();
        }
    }
    constructor(instance: V) {
        this._instance = instance;
    }
    protected _instance: V
    protected _memory!: IEmptyMemory<U>;
    abstract get DataType(): U;
    abstract get SwarmType(): T;
    get Value(): V { return this._instance; }
    abstract get saveID(): string;
    protected abstract OnActivate(): void;
    GetMemoryObject(): IEmptyMemory<U> { return this._memory; }
    AssignMemory(mem: IEmptyMemory<U>) {
        this._memory = mem;
    }
    InitNewObject() { }
    GetSpawnRequirements(): ISpawnRequirement {
        return SwarmTypeBase.NoSpawnRequirement;
    }

    static readonly NoSpawnRequirement: ISpawnRequirement = {
        priority: Priority.Lowest,
        neededIn: 1500,
        minBody: [],
        growthTemplate: []
    }
}

export abstract class SwarmItemWithName<T extends SwarmType.SwarmRoom | SwarmType.SwarmFlag,
    U extends SwarmDataType.Room | SwarmDataType.Flag, V extends Room | Flag> extends SwarmTypeBase<T, U, V> {
    get name() { return this._instance.name }
    get saveID() { return this.name; }
}

export abstract class SwarmObject<T extends SwarmType, U extends SwarmDataType, V extends RoomObject> extends SwarmTypeBase<T, U, V> {
    get pos() { return this._instance.pos; }
    get room() { return this._instance.room!; } // This should get the room object i created.
}
export abstract class SwarmObjectWithID<T extends SwarmType, U extends SwarmDataType,
    V extends Source | Creep | Structure | Mineral | Resource | ConstructionSite | Nuke | Tombstone> extends SwarmObject<T, U, V> {
    get id() { return this._instance.id; }
    get saveID() { return this.id; }
}

export abstract class NotifiableSwarmObject<T extends SwarmType, U extends SwarmDataType, V extends Creep | Structure>
    extends SwarmObjectWithID<T, U, V> {
    notifyWhenAttacked(enabled: boolean = false) { // ActionIntent
        if ((this._instance as Structure).notifyWhenAttacked) {
            // Using this to trick the compiler into letting me return the value because apparently,
            // it doesn't like generic ScreepsReturnCode as a return despite the typings.
            return (this._instance as Structure).notifyWhenAttacked(enabled) as OK;
        }
        return OK;
    }
}

export abstract class OwnableSwarmObject<T extends SwarmType, U extends SwarmDataType,
    V extends Creep | OwnedStructure> extends NotifiableSwarmObject<T, U, V> {
    get my() { return this._instance.my; }
    get owner() { return this._instance.owner; }
}
export abstract class SwarmRoomObject<T extends SwarmType,
    U extends Mineral | Resource | Tombstone | Nuke | ConstructionSite | Source>
    extends SwarmObjectWithID<T, SwarmDataType.RoomObject, U> {
    get DataType(): SwarmDataType.RoomObject { return SwarmDataType.RoomObject }
    get room(): Room { return this._instance.room! }
}

export class SwarmMineral extends SwarmRoomObject<SwarmType.SwarmMineral, Mineral> {
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
    get SwarmType(): SwarmType.SwarmMineral { return SwarmType.SwarmMineral; }
    get density() { return this._instance.density; }
    get mineralAmount() { return this._instance.mineralAmount; }
    get mineralType() { return this._instance.mineralType; }
    get ticksToRegeneration() { return this._instance.ticksToRegeneration; }
    protected OnActivate() {
        console.log("Successfully activated a Mineral");
    }
}
export function MakeSwarmMineral(mineral: Mineral): ISwarmMineral {
    return new SwarmMineral(mineral);
}

export class SwarmTombstone extends SwarmRoomObject<SwarmType.SwarmTombstone, Tombstone> implements ISwarmTombstone, Tombstone {
    get SwarmType(): SwarmType.SwarmTombstone { return SwarmType.SwarmTombstone }
    get creep() { return this._instance.creep; }
    get deathTime() { return this._instance.deathTime; }
    get store() { return this._instance.store; }
    get ticksToDecay() { return this._instance.ticksToDecay; }
    protected OnActivate() {
        console.log("Successfully activated a Tombstone");
    }
}
export function MakeSwarmTombstone(tombStone: Tombstone): ISwarmTombstone {
    return new SwarmTombstone(tombStone);
}

export class SwarmResource extends SwarmRoomObject<SwarmType.SwarmResource, Resource> implements ISwarmResource, Resource {
    get storageMemoryType() { return SwarmDataType.RoomObject; }
    get SwarmType(): SwarmType.SwarmResource { return SwarmType.SwarmResource; }
    get amount() { return this._instance.amount; }
    get resourceType() { return this._instance.resourceType; }
    protected OnActivate() {
        console.log("Successfully activated a Resource");
    }
}
export function MakeSwarmResource(resource: Resource): ISwarmResource {
    return new SwarmResource(resource);
}

export class SwarmNuke extends SwarmRoomObject<SwarmType.SwarmNuke, Nuke> implements ISwarmNuke, Nuke {
    get storageMemoryType() { return SwarmDataType.RoomObject; }
    get SwarmType(): SwarmType.SwarmNuke { return SwarmType.SwarmNuke; }
    get launchRoomName() { return this._instance.launchRoomName; }
    get timeToLand() { return this._instance.timeToLand; }
    protected OnActivate() {
        console.log("Successfully activated a Nuke");
    }
}
export function MakeSwarmNuke(nuke: Nuke): ISwarmNuke {
    return new SwarmNuke(nuke);
}