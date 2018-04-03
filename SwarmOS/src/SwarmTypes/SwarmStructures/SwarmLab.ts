import { OwnedSwarmStructure } from "./SwarmStructure";
import { SwarmCreep } from "SwarmTypes/SwarmCreep";
import { LabMemory } from "SwarmMemory/StructureMemory";

export class SwarmLab extends OwnedSwarmStructure<STRUCTURE_LAB, StructureLab,
    LabMemory> implements StructureLab {
    get cooldown() { return this._instance.cooldown; }
    get energy() { return this._instance.energy; }
    get energyCapacity() { return this._instance.energyCapacity; }
    get mineralAmount() { return this._instance.mineralAmount; }
    get mineralCapacity() { return this._instance.mineralCapacity; }
    get mineralType() { return this._instance.mineralType; }

    boostCreep(creep: SwarmCreep, bodyPartsCount?: number) {
        return this._instance.boostCreep(creep, bodyPartsCount);
    }
    runReaction(lab1: StructureLab, lab2: StructureLab) {
        return this._instance.runReaction(lab1, lab2);
    }
    protected OnPrepObject() { }
    protected OnActivate() { }
}