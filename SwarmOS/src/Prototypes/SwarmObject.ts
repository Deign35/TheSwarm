export class SwarmItem<T> {
    constructor(protected _instance: T) { this.Init(); }
    protected Init() { }
    get Value() { return this._instance; }
}
export class SwarmObject<T extends Source | Creep | Structure | Mineral | Resource | ConstructionSite | Nuke | Tombstone> extends SwarmItem<T> {
    get pos() { return this._instance.pos; }
    get room() { return this._instance.room; }
    get id() { return this._instance.id; }
}

export class SwarmTombstone extends SwarmObject<Tombstone> {
    get creep() { return this._instance.creep; }
    get deathTime() { return this._instance.deathTime; }
    get store() { return this._instance.store; }
    get ticksToDecay() { return this._instance.ticksToDecay; }
}

export class NotifiableSwarmObject<T extends Creep | Structure> extends SwarmObject<T> {
    NotifyWhenAttacked(enabled: boolean = false) { // ActionIntent
        this._instance.notifyWhenAttacked(enabled);
    }
}

export class OwnableSwarmObject<T extends Creep | OwnedStructure> extends NotifiableSwarmObject<T> {
    get my() { return this._instance.my; }
    get owner() { return this._instance.owner; }
}