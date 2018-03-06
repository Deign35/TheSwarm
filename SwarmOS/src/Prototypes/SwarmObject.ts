export class SwarmObject<T extends Source | Creep | Structure | Mineral | Resource | ConstructionSite | Nuke> {
    constructor(protected _instance: T) { this.Init(); }
    protected Init() { }
    get pos() { return this._instance.pos; }
    get room() { return this._instance.room; }
    get id() { return this._instance.id; }
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