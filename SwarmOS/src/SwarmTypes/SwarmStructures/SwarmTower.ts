import { OwnedSwarmStructure } from "./SwarmStructure";
import { profile } from "Tools/Profiler";
import { TowerMemory } from "SwarmMemory/StructureMemory";

@profile
export class SwarmTower extends OwnedSwarmStructure<SwarmType.SwarmTower, STRUCTURE_TOWER,
ITowerData, TowerMemory, StructureTower> implements StructureTower {
    get energy() { return this._instance.energy; }
    get energyCapacity() { return this._instance.energyCapacity; }

    attack(target: Creep) {
        return this._instance.attack(target);
    }
    heal(target: Creep) {
        return this._instance.heal(target);
    }
    repair(target: Structure) {
        return this._instance.repair(target);
    }
    protected OnPrepObject() { }
    protected OnActivate() { }
}