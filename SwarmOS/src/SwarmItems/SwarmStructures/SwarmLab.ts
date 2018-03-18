import { OwnedSwarmStructure } from "./SwarmStructure";
import { SwarmCreep } from "SwarmItems/SwarmCreep";

export class SwarmLab extends OwnedSwarmStructure<STRUCTURE_LAB, StructureLab> implements ISwarmLab, StructureLab {
    get swarmType(): SwarmType.SwarmLab { return SwarmType.SwarmLab; }
    get cooldown() { return this._instance.cooldown; }
    get energy() { return this._instance.energy; }
    get energyCapacity() { return this._instance.energyCapacity; }
    get mineralAmount() { return this._instance.mineralAmount; }
    get mineralCapacity() { return this._instance.mineralCapacity; }
    get mineralType() { return this._instance.mineralType; }

    boostCreep(creep: SwarmCreep, bodyPartsCount?: number) {
        return this._instance.boostCreep(creep.value, bodyPartsCount);
    }
    runReaction(lab1: SwarmLab, lab2: SwarmLab) {
        return this._instance.runReaction(lab1.value, lab2.value);
    }
}
export function MakeSwarmLab(lab: StructureLab): TSwarmLab {
    return new SwarmLab(lab);
}