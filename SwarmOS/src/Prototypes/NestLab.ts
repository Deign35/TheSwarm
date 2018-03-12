import { OwnedSwarmStructure } from "./SwarmStructure";
import { SwarmCreep } from "./SwarmCreep";

export class NestLab extends OwnedSwarmStructure<StructureLab> {
    get cooldown() { return this._instance.cooldown; }
    get energy() { return this._instance.energy; }
    get energyCapacity() { return this._instance.energyCapacity; }
    get mineralAmount() { return this._instance.mineralAmount; }
    get mineralCapacity() { return this._instance.mineralCapacity; }
    get mineralType() { return this._instance.mineralType; }

    boostCreep(creep: SwarmCreep, bodyPartsCount?: number) {
        return this._instance.boostCreep(creep.Value, bodyPartsCount);
    }
    runReaction(lab1: NestLab, lab2: NestLab) {
        return this._instance.runReaction(lab1.Value, lab2.Value);
    }
}