//ISwarmObject < T extends SwarmMemoryTypes, U extends Room | RoomObject >
/**saveID: string;
    IsActive: boolean;

    GetMemType(): number;
    Activate(): void;
    AssignObject(obj: T): void;
    GetCopyOfMemory(): T
    GetCopyOfObject(): U */

abstract class SwarmTypeBase<T extends TSwarmMemory, U extends Room | RoomObject | Creep | Flag | Structure<StructureConstant>>
    implements ISwarmObject<T, U> {
    get prototype(): U {
        return this.prototype;
    }
    get saveID() {
        return this._memory.id;
    }
    get IsActive(): boolean {
        return !!this._instance && !!this._memory;
    }
    Activate(): void {
        if (this.IsActive) {
            this.OnActivate();
        }
    }
    protected _instance!: U
    protected _memory!: T;
    GetCopyOfObject(): U { return this._instance; }
    protected abstract OnActivate(): void;
    GetCopyOfMemory(): T { return this._memory; }
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

    GetMemType(): SwarmType {
        if (this._memory) {
            return this._memory!.GetData(MEM_TYPE); // This needs to be changed to expose the data members
        }

        return SwarmType.Any;
    }
    AssignObject(obj: U, objMemory: T): void {
        this._instance = obj;
        this._memory = objMemory;
    }
}

export abstract class SwarmItemWithName<T extends TSwarmMemory, U extends Room | Flag> extends SwarmTypeBase<T, U> {
    get name() { return this._instance.name }
    get saveID() { return this.name; }
}

export abstract class SwarmObject<T extends TSwarmMemory, U extends RoomObject> extends SwarmTypeBase<T, U> {
    get pos() { return this._instance.pos; }
    get room() { return this._instance.room!; } // This should get the room object i created.
}
export abstract class SwarmObjectWithID<T extends TSwarmMemory,
    U extends Source | Creep | Structure | Mineral | Resource | ConstructionSite | Nuke | Tombstone>
    extends SwarmObject<T, U> {
    get id() { return this._instance.id; }
    get saveID() { return this.id; }
}

export abstract class NotifiableSwarmObject<T extends TSwarmMemory, U extends Creep | Structure>
    extends SwarmObjectWithID<T, U> {
    notifyWhenAttacked(enabled: boolean = false) { // ActionIntent
        if ((this._instance as Structure).notifyWhenAttacked) {
            // Using this to trick the compiler into letting me return the value because apparently,
            // it doesn't like generic ScreepsReturnCode as a return despite the typings.
            return (this._instance as Structure).notifyWhenAttacked(enabled) as OK;
        }
        return OK;
    }
}

export abstract class OwnableSwarmObject<T extends TSwarmMemory, U extends Creep | OwnedStructure> extends NotifiableSwarmObject<T, U> {
    get my() { return this._instance.my; }
    get owner() { return this._instance.owner; }
}
export abstract class SwarmRoomObject<T extends TSwarmMemory,
    U extends Mineral | Resource | Tombstone | Nuke | ConstructionSite | Source>
    extends SwarmObjectWithID<T, U> {
    get DataType(): SwarmDataType.RoomObject { return SwarmDataType.RoomObject }
    get room(): Room { return this._instance.room! }
}

export class SwarmMineral extends SwarmRoomObject<IRoomObjectMemory, Mineral> {
    get SwarmType(): SwarmType.SwarmMineral { return SwarmType.SwarmMineral; }
    get density() { return this._instance.density; }
    get mineralAmount() { return this._instance.mineralAmount; }
    get mineralType() { return this._instance.mineralType; }
    get ticksToRegeneration() { return this._instance.ticksToRegeneration; }
    protected OnActivate() {
        console.log("Successfully activated a Mineral");
    }
}

export class SwarmTombstone extends SwarmRoomObject<IRoomObjectMemory, Tombstone> implements ISwarmTombstone, Tombstone {
    get SwarmType(): SwarmType.SwarmTombstone { return SwarmType.SwarmTombstone }
    get creep() { return this._instance.creep; }
    get deathTime() { return this._instance.deathTime; }
    get store() { return this._instance.store; }
    get ticksToDecay() { return this._instance.ticksToDecay; }
    protected OnActivate() {
        console.log("Successfully activated a Tombstone");
    }
}

export class SwarmResource extends SwarmRoomObject<IRoomObjectMemory, Resource> implements ISwarmResource, Resource {
    get storageMemoryType() { return SwarmDataType.RoomObject; }
    get SwarmType(): SwarmType.SwarmResource { return SwarmType.SwarmResource; }
    get amount() { return this._instance.amount; }
    get resourceType() { return this._instance.resourceType; }
    protected OnActivate() {
        console.log("Successfully activated a Resource");
    }
}

export class SwarmNuke extends SwarmRoomObject<IRoomObjectMemory, Nuke> implements ISwarmNuke, Nuke {
    get storageMemoryType() { return SwarmDataType.RoomObject; }
    get SwarmType(): SwarmType.SwarmNuke { return SwarmType.SwarmNuke; }
    get launchRoomName() { return this._instance.launchRoomName; }
    get timeToLand() { return this._instance.timeToLand; }
    protected OnActivate() {
        console.log("Successfully activated a Nuke");
    }
}