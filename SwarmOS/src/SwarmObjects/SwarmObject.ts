export abstract class SwarmItem<T> implements ISwarmItem<T> {
    constructor(instance: T) {
        this._instance = instance;
        this.Init();
    }
    protected _instance: T;
    protected Init() { }
    get Value() { return this._instance; }
}
export abstract class SwarmObject<T extends Source | Creep
    | Structure | Mineral | Resource
    | ConstructionSite | Nuke | Tombstone> extends SwarmItem<T> implements ISwarmObject<T> {
    get pos() { return this._instance.pos; }
    get room() { return this._instance.room; }
    get id() { return this._instance.id; }
    get prototype(): T { return this._instance.prototype as T; }
}

export class SwarmTombstone extends SwarmObject<Tombstone> implements ISwarmTombstone, Tombstone {
    didSuicide(): boolean {
        throw new Error("Method not implemented.");
    }
    get creep() { return this._instance.creep; }
    get deathTime() { return this._instance.deathTime; }
    get store() { return this._instance.store; }
    get ticksToDecay() { return this._instance.ticksToDecay; }


}
export function MakeSwarmTombstone(tombStone: Tombstone): TSwarmTombstone {
    return new SwarmTombstone(tombStone);
}

export class NotifiableSwarmObject<T extends Creep | Structure | ConstructionSite> extends SwarmObject<T> implements INotifiableSwarmObject<T> {
    notifyWhenAttacked(enabled: boolean = false) { // ActionIntent
        if ((this._instance as Structure).notifyWhenAttacked) {
            // Using this to trick the compiler into letting me return the value because apparently,
            // it doesn't like generic ScreepsReturnCode as a return despite the typings.
            return (this._instance as Structure).notifyWhenAttacked(enabled) as OK;
        }
        return OK;
    }
}

export class OwnableSwarmObject<T extends Creep | OwnedStructure> extends NotifiableSwarmObject<T> implements IOwnableSwarmObject<T> {
    get my() { return this._instance.my; }
    get owner() { return this._instance.owner; }
}