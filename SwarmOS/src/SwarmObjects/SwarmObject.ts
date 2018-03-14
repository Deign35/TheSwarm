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