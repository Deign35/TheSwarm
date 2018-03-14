export abstract class SwarmItem<T, U extends SwarmType> implements ISwarmItem<T, U> {
    constructor(instance: T) {
        this._instance = instance;
        this.Init();
    }
    protected _instance: T;
    protected Init() { }
    get Value() { return this._instance; }
    abstract get swarmType(): U;
}
export abstract class SwarmObject<T extends Source | Creep
    | Structure | Mineral | Resource
    | ConstructionSite | Nuke | Tombstone, U extends SwarmType> extends SwarmItem<T, U> implements ISwarmObject<T, U> {
    get pos() { return this._instance.pos; }
    get room() { return this._instance.room; }
    get id() { return this._instance.id; }
    get prototype(): T { return this._instance.prototype as T; }
}

export class SwarmTombstone extends SwarmObject<Tombstone, SwarmType.SwarmTombstone> implements ISwarmTombstone, Tombstone {
    get swarmType(): SwarmType.SwarmTombstone { return SwarmType.SwarmTombstone }
    get creep() { return this._instance.creep; }
    get deathTime() { return this._instance.deathTime; }
    get store() { return this._instance.store; }
    get ticksToDecay() { return this._instance.ticksToDecay; }
}
export function MakeSwarmTombstone(tombStone: Tombstone): TSwarmTombstone {
    return new SwarmTombstone(tombStone);
}

export abstract class NotifiableSwarmObject<T extends Creep | Structure | ConstructionSite, U extends SwarmType> extends SwarmObject<T, U> implements INotifiableSwarmObject<T, U> {
    notifyWhenAttacked(enabled: boolean = false) { // ActionIntent
        if ((this._instance as Structure).notifyWhenAttacked) {
            // Using this to trick the compiler into letting me return the value because apparently,
            // it doesn't like generic ScreepsReturnCode as a return despite the typings.
            return (this._instance as Structure).notifyWhenAttacked(enabled) as OK;
        }
        return OK;
    }
}

export abstract class OwnableSwarmObject<T extends Creep | OwnedStructure | ConstructionSite, U extends SwarmType> extends NotifiableSwarmObject<T, U> implements IOwnableSwarmObject<T, U> {
    get my() { return this._instance.my; }
    get owner() { return this._instance.owner; }
}

export class SwarmMineral extends SwarmObject<Mineral, SwarmType.SwarmMineral> implements ISwarmMineral, Mineral {
    get swarmType(): SwarmType.SwarmMineral { return SwarmType.SwarmMineral; }
    get density() { return this._instance.density; }
    get mineralAmount() { return this._instance.mineralAmount; }
    get mineralType() { return this._instance.mineralType; }
    get ticksToRegeneration() { return this._instance.ticksToRegeneration; }
}
export function MakeSwarmMineral(mineral: Mineral): TSwarmMineral { return new SwarmMineral(mineral); }

export class SwarmSource extends SwarmObject<Source, SwarmType.SwarmSource> implements ISwarmSource, Source {
    get swarmType(): SwarmType.SwarmSource { return SwarmType.SwarmSource; }
    get energy() { return this._instance.energy; }
    get energyCapacity() { return this._instance.energyCapacity; }
    get room() { return this._instance.room; }
    get ticksToRegeneration() { return this._instance.ticksToRegeneration; }
}
export function MakeSwarmSource(source: Source): TSwarmSource { return new SwarmSource(source); }

export class SwarmResource extends SwarmObject<Resource, SwarmType.SwarmResource> implements ISwarmResource, Resource {
    get swarmType(): SwarmType.SwarmResource { return SwarmType.SwarmResource; }
    get amount() { return this._instance.amount; }
    get resourceType() { return this._instance.resourceType; }
}
export function MakeSwarmResource(resource: Resource): TSwarmResource { return new SwarmResource(resource); }

export class SwarmNuke extends SwarmObject<Nuke, SwarmType.SwarmNuke> implements ISwarmNuke, Nuke {
    get swarmType(): SwarmType.SwarmNuke { return SwarmType.SwarmNuke; }
    get launchRoomName() { return this._instance.launchRoomName; }
    get timeToLand() { return this._instance.timeToLand; }
}
export function MakeSwarmNuke(nuke: Nuke): TSwarmNuke { return new SwarmNuke(nuke); }