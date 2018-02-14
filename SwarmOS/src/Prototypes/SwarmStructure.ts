import { NotifiableSwarmObject } from "./SwarmObject";
import * as _ from "lodash";

const STORE_TOTAL = 'StoreTotal';
export class SwarmStructure<T extends Structure> extends NotifiableSwarmObject<T> {
    protected data: { [id: string]: any } = {};
    get hits() { return this._instance.hits };
    get hitsMax() { return this._instance.hitsMax };
    get structureType() { return this._instance.structureType };
    Destroy() {
        this._instance.destroy();
    }
    IsActive() {
        this._instance.isActive;
    }
}

export class SwarmContainer extends SwarmStructure<StructureContainer> {
    protected data: { [id: string]: any } = {};
    get store() { return this._instance.store};
    get storeCapacity() { return this._instance.storeCapacity};
    get ticksToDecay() { return this._instance.ticksToDecay};
    // Instead of T extends Creep, what about different classes??
    get carryTotal() {
        if (!this.data[STORE_TOTAL]) {
            this.data[STORE_TOTAL] = _.sum(this._instance.store);
        }
        return this.data[STORE_TOTAL];
    }
}

export class SwarmRoad extends SwarmStructure<StructureRoad> {
    get ticksToDecay() { return this._instance.ticksToDecay};
}

export class SwarmWall extends SwarmStructure<StructureWall> { }
// Other non-owned Structuretypes: StructurePowerBank, StructurePortal


export class OwnedSwarmStructure<T extends OwnedStructure> extends SwarmStructure<T> {
    get my() { return this._instance.my };
    get owner() { return this._instance.owner };
}