import { OwnedSwarmStructure, SwarmStructure } from "./SwarmStructure";
import { profile } from "Tools/Profiler";
import { SwarmCreep } from "SwarmTypes/SwarmCreep";
import { StructureMemory, TowerMemory } from "SwarmMemory/StructureMemory";

@profile
export class SwarmTower extends OwnedSwarmStructure<STRUCTURE_TOWER, StructureTower,
TowerMemory> implements StructureTower {
    get energy() { return this._instance.energy; }
    get energyCapacity() { return this._instance.energyCapacity; }

    attack(target: SwarmCreep) {
        return this._instance.attack(target);
    }
    heal(target: SwarmCreep) {
        return this._instance.heal(target);
    }
    repair(target: SwarmStructure<StructureConstant, Structure, StructureMemory>) {
        return this._instance.repair(target);
    }
    protected OnActivate() {
        console.log("Successfully activated a Tower");
    }
}