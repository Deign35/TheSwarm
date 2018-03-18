import { OwnedSwarmStructure, SwarmStructure } from "./SwarmStructure";
import { SwarmCreep } from "SwarmItems/SwarmCreep";
import { StructureMemory } from "Memory/StorageMemory";
import { profile } from "Tools/Profiler";

@profile
export class SwarmTower extends OwnedSwarmStructure<STRUCTURE_TOWER, StructureTower> implements ISwarmTower, StructureTower {
    get swarmType(): SwarmType.SwarmTower { return SwarmType.SwarmTower; }
    get energy() { return this._instance.energy; }
    get energyCapacity() { return this._instance.energyCapacity; }

    attack(target: SwarmCreep) {
        return this._instance.attack(target.value);
    }
    heal(target: SwarmCreep) {
        return this._instance.heal(target.value);
    }
    repair<U extends StructureConstant, T extends Structure<U>, V extends SwarmType>(target: SwarmStructure<U, T>) {
        return this._instance.repair(target.value);
    }
}
export function MakeSwarmTower(tower: StructureTower): TSwarmTower {
    return new SwarmTower(tower);
}