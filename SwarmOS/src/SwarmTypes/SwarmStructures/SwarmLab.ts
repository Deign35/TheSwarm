import { OwnedSwarmStructure } from "./SwarmStructure";
import { SwarmCreep } from "SwarmTypes/SwarmCreep";

export class SwarmLab extends OwnedSwarmStructure<SwarmType.SwarmLab, StructureLab, STRUCTURE_LAB> implements ISwarmLab, StructureLab {
    get SwarmType(): SwarmType.SwarmLab { return SwarmType.SwarmLab; }
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
    protected OnActivate() {
        console.log("Successfully activated a Lab");
    }
}
export function MakeSwarmLab(lab: StructureLab): ISwarmLab {
    return new SwarmLab(lab);
}