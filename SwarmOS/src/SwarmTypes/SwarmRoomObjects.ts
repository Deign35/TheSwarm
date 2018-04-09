import { SwarmTypeBase } from "SwarmTypes/SwarmTypes";

export type SwarmRoomObject = SwarmObject_RoomObject<IData, RoomObject>;

export abstract class SwarmObject_RoomObject<T extends IData, U extends RoomObject>
    extends SwarmTypeBase<T, U> {
    get pos() { return this._instance.pos; }
    get room() { return this._instance.room; } // This should get the room object i created.
    get prototype(): U { return this._instance as U }
}


export class SwarmMineral extends SwarmObject_RoomObject<IData, Mineral> implements AIMineral, Mineral {
    get density() { return this._instance.density; }
    get mineralAmount() { return this._instance.mineralAmount; }
    get mineralType() { return this._instance.mineralType; }
    get ticksToRegeneration() { return this._instance.ticksToRegeneration; }
}


export class SwarmNuke extends SwarmObject_RoomObject<IData, Nuke> implements AINuke, Nuke {
    get launchRoomName() { return this._instance.launchRoomName; }
    get timeToLand() { return this._instance.timeToLand; }
}

export class SwarmResource extends SwarmObject_RoomObject<IData, Resource> implements AIResource, Resource {
    get amount() { return this._instance.amount; }
    get resourceType() { return this._instance.resourceType; }
}

export class SwarmSite extends SwarmObject_RoomObject<IData, ConstructionSite>
    implements AISite, ConstructionSite {
    /** Implement ConstructionSite */
    get my() { return this._instance.my; }
    get owner() { return this._instance.owner; }
    get progress() { return this._instance.progress; }
    get progressTotal() { return this._instance.progressTotal; }
    get structureType() { return this._instance.structureType; }
    remove() { return this._instance.remove(); }
}

export class SwarmSource extends SwarmObject_RoomObject<IData, Source> implements AISource, Source {
    get containerID(): string | undefined { return this.memory.GetData('containerID'); }
    get creepID(): string | undefined { return this.memory.GetData('creepID'); }
    get linkID(): string | undefined { return this.memory.GetData('linkID'); }
    get pileID(): string | undefined { return this.memory.GetData('pileID'); }
    get constructionID(): string | undefined { return this.memory.GetData('constructionID'); }

    get energy() { return this._instance.energy; }
    get energyCapacity() { return this._instance.energyCapacity; }
    get room() { return this._instance.room; }
    get ticksToRegeneration() { return this._instance.ticksToRegeneration; }
}

export class SwarmTombstone extends SwarmObject_RoomObject<IData, Tombstone> implements AITombstone, Tombstone {
    get creep() { return this._instance.creep; }
    get deathTime() { return this._instance.deathTime; }
    get store() { return this._instance.store; }
    get ticksToDecay() { return this._instance.ticksToDecay; }
}
