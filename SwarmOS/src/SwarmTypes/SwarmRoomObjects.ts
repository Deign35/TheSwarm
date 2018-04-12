import { SwarmTypeBase } from "SwarmTypes/SwarmTypes";
import { SwarmLoader } from "./SwarmLoader";

export type SwarmRoomObjectType = SwarmObject_BaseRoomObject<RoomObject>;

export abstract class SwarmObject_BaseRoomObject<T extends RoomObject>
    extends SwarmTypeBase<IData, T> {
    get pos() { return this._instance.pos; }
    get room() { return this._instance.room; } // This should get the room object i created.
    get prototype(): T { return this._instance as T }
}


export class SwarmMineral extends SwarmObject_BaseRoomObject<Mineral> implements AIMineral, Mineral {
    get containerID(): string | undefined { return this.memory.GetData('containerID'); }
    get creepID(): string | undefined { return this.memory.GetData('creepID'); }
    get pileID(): string | undefined { return this.memory.GetData('pileID'); }

    get density() { return this._instance.density; }
    get mineralAmount() { return this._instance.mineralAmount; }
    get mineralType() { return this._instance.mineralType; }
    get ticksToRegeneration() { return this._instance.ticksToRegeneration; }
}


export class SwarmNuke extends SwarmObject_BaseRoomObject<Nuke> implements AINuke, Nuke {
    get launchRoomName() { return this._instance.launchRoomName; }
    get timeToLand() { return this._instance.timeToLand; }
}

export class SwarmResource extends SwarmObject_BaseRoomObject<Resource> implements AIResource, Resource {
    get amount() { return this._instance.amount; }
    get resourceType() { return this._instance.resourceType; }
}

export class SwarmSite extends SwarmObject_BaseRoomObject<ConstructionSite>
    implements AISite, ConstructionSite {
    get my() { return this._instance.my; }
    get owner() { return this._instance.owner; }
    get progress() { return this._instance.progress; }
    get progressTotal() { return this._instance.progressTotal; }
    get structureType() { return this._instance.structureType; }
    remove() { return this._instance.remove(); }
}

export class SwarmSource extends SwarmObject_BaseRoomObject<Source> implements AISource, Source {
    RefreshObject(): void {
        throw new Error("Method not implemented.");
    }
    FinalizeObject(): void {
        throw new Error("Method not implemented.");
    }
    AssignCreep(creepName: string) {
        this.memory.SetData('creepID', creepName, true);
        return true;
    }
    get updateFrequency() { return 5; }
    get containerID(): string | undefined { return this.memory.GetData('containerID'); }
    get creepID(): string | undefined { return this.memory.GetData('creepID'); }
    get linkID(): string | undefined { return this.memory.GetData('linkID'); }
    get pileID(): string | undefined { return this.memory.GetData('pileID'); }
    get constructionID(): string | undefined { return this.memory.GetData('constructionID'); }

    get energy() { return this._instance.energy; }
    get energyCapacity() { return this._instance.energyCapacity; }
    get room() { return this._instance.room; }
    get ticksToRegeneration() { return this._instance.ticksToRegeneration; }

    PrepObject() {
        if (this.creepID && !SwarmLoader.HasObject(this.creepID, MASTER_CREEP_MEMORY_ID)) {
            this.memory.DeleteData('creepID');
        }
        if (this.containerID && !SwarmLoader.HasObject(this.containerID, MASTER_STRUCTURE_MEMORY_ID)) {
            this.memory.DeleteData('containerID');
        }
        if (this.linkID && !SwarmLoader.HasObject(this.linkID, MASTER_STRUCTURE_MEMORY_ID)) {
            this.memory.DeleteData('linkID');
        }
        if (this.pileID && !SwarmLoader.HasObject(this.pileID, MASTER_ROOMOBJECT_MEMORY_ID)) {
            this.memory.DeleteData('pileID');
        }
        if (this.constructionID && !SwarmLoader.HasObject(this.constructionID, MASTER_ROOMOBJECT_MEMORY_ID)) {
            this.memory.DeleteData('constructionID');
        }
    }
}

export class SwarmTombstone extends SwarmObject_BaseRoomObject<Tombstone> implements AITombstone, Tombstone {
    get creep() { return this._instance.creep; }
    get deathTime() { return this._instance.deathTime; }
    get store() { return this._instance.store; }
    get ticksToDecay() { return this._instance.ticksToDecay; }
}
