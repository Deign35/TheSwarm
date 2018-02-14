export class SwarmObject<T extends Source | Creep | Structure | Mineral | Resource | ConstructionSite | Nuke> {
    constructor(protected _instance: T) { }
    get pos() { return this._instance.pos; }
    get room() { return this._instance.room; }
    get id() { return this._instance.id; }
}

export class NotifiableSwarmObject<T extends Creep | Structure> extends SwarmObject<T> {
    NotifyWhenAttacked(enabled: boolean) {
        this._instance.notifyWhenAttacked(enabled);
    }
}