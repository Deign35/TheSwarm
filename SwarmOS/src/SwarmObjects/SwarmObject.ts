import { RoomObjectMemory, RoomMemory } from "Memory/StorageMemory";

abstract class SwarmItem<T, U extends SwarmType, V extends ISwarmMemory> implements ISwarmItem<T, U> {
    constructor(instance: T, memory: V) {
        this._instance = instance;
        this._memory = memory;
        this.Init();
    }
    protected _instance: T;
    protected _memory: V;
    protected Init() { }
    get Value() { return this._instance; }
    abstract get swarmType(): U;
    GetMemoryObject() { return this._memory; }

}
export abstract class SwarmItemWithName<T extends Room | Flag, U extends SwarmType.SwarmRoom | SwarmType.SwarmFlag, V extends ISwarmMemory> extends SwarmItem<T, U, V> {
    get name() { return this._instance.name }
}
export abstract class SwarmObject<T extends Source | Creep
    | Structure | Mineral | Resource | ConstructionSite | Nuke | Tombstone,
    U extends SwarmType, V extends ISwarmMemory> extends SwarmItem<T, U, V> implements ISwarmObject<T, U> {
    get pos() { return this._instance.pos; }
    get room() { return this._instance.room; } // This should get the room object i created.
    get id() { return this._instance.id; }
    get prototype(): T { return this._instance.prototype as T; }

    GetSpawnRequirements(): TEMP_SpawnReqType | undefined {
        return {
            minBody: [WORK, MOVE, CARRY],
            priority: Priority.Low
        };
    }
}

export class SwarmTombstone extends SwarmObject<Tombstone, SwarmType.SwarmTombstone, RoomObjectMemory> implements ISwarmTombstone, Tombstone {
    get swarmType(): SwarmType.SwarmTombstone { return SwarmType.SwarmTombstone }
    get creep() { return this._instance.creep; }
    get deathTime() { return this._instance.deathTime; }
    get store() { return this._instance.store; }
    get ticksToDecay() { return this._instance.ticksToDecay; }
}
export function MakeSwarmTombstone(tombStone: Tombstone, memory: RoomObjectMemory): TSwarmTombstone {
    return new SwarmTombstone(tombStone, memory);
}

export abstract class NotifiableSwarmObject<T extends Creep | Structure | ConstructionSite,
    U extends SwarmType, V extends ISwarmMemory> extends SwarmObject<T, U, V> implements INotifiableSwarmObject<T, U> {
    notifyWhenAttacked(enabled: boolean = false) { // ActionIntent
        if ((this._instance as Structure).notifyWhenAttacked) {
            // Using this to trick the compiler into letting me return the value because apparently,
            // it doesn't like generic ScreepsReturnCode as a return despite the typings.
            return (this._instance as Structure).notifyWhenAttacked(enabled) as OK;
        }
        return OK;
    }
}

export abstract class OwnableSwarmObject<T extends Creep | OwnedStructure | ConstructionSite,
    U extends SwarmType, V extends ISwarmMemory> extends NotifiableSwarmObject<T, U, V> implements IOwnableSwarmObject<T, U> {
    get my() { return this._instance.my; }
    get owner() { return this._instance.owner; }
}

export class SwarmMineral extends SwarmObject<Mineral, SwarmType.SwarmMineral, RoomObjectMemory> implements ISwarmMineral, Mineral {
    get swarmType(): SwarmType.SwarmMineral { return SwarmType.SwarmMineral; }
    get density() { return this._instance.density; }
    get mineralAmount() { return this._instance.mineralAmount; }
    get mineralType() { return this._instance.mineralType; }
    get ticksToRegeneration() { return this._instance.ticksToRegeneration; }
}
export function MakeSwarmMineral(mineral: Mineral, memory: RoomObjectMemory): TSwarmMineral {
    return new SwarmMineral(mineral, memory);
}

export class SwarmSource extends SwarmObject<Source, SwarmType.SwarmSource, RoomObjectMemory> implements ISwarmSource, Source {
    get swarmType(): SwarmType.SwarmSource { return SwarmType.SwarmSource; }
    get energy() { return this._instance.energy; }
    get energyCapacity() { return this._instance.energyCapacity; }
    get room() { return this._instance.room; }
    get ticksToRegeneration() { return this._instance.ticksToRegeneration; }

    protected data!: SourceData;
    Activate() {
        // Get the creep and control it from here to do what we want.
    }
    GetSpawnRequirements(): TEMP_SpawnReqType {
        return {
            minBody: [WORK, WORK, CARRY, MOVE],
            priority: Priority.High
        }
    }
}
export function MakeSwarmSource(source: Source, memory: RoomObjectMemory): TSwarmSource {
    return new SwarmSource(source, memory);
}

export class SwarmResource extends SwarmObject<Resource, SwarmType.SwarmResource, RoomObjectMemory> implements ISwarmResource, Resource {
    get swarmType(): SwarmType.SwarmResource { return SwarmType.SwarmResource; }
    get amount() { return this._instance.amount; }
    get resourceType() { return this._instance.resourceType; }
}
export function MakeSwarmResource(resource: Resource, memory: RoomObjectMemory): TSwarmResource {
    return new SwarmResource(resource, memory);
}

export class SwarmNuke extends SwarmObject<Nuke, SwarmType.SwarmNuke, RoomObjectMemory> implements ISwarmNuke, Nuke {
    get swarmType(): SwarmType.SwarmNuke { return SwarmType.SwarmNuke; }
    get launchRoomName() { return this._instance.launchRoomName; }
    get timeToLand() { return this._instance.timeToLand; }
}
export function MakeSwarmNuke(nuke: Nuke, memory: RoomObjectMemory): TSwarmNuke {
    return new SwarmNuke(nuke, memory);
}