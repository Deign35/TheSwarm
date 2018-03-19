import { OwnedSwarmStructure, SwarmStructure } from "./SwarmStructure";
import { StructureMemory } from "Memory/StorageMemory";
import { profile } from "Tools/Profiler";
import { SwarmCreep } from "SwarmTypes/SwarmCreep";

@profile
export class SwarmTower extends OwnedSwarmStructure<SwarmType.SwarmTower, STRUCTURE_TOWER, StructureTower> implements ISwarmTower, StructureTower {


    get SwarmType(): SwarmType.SwarmTower { return SwarmType.SwarmTower; }
    get energy() { return this._instance.energy; }
    get energyCapacity() { return this._instance.energyCapacity; }

    attack(target: SwarmCreep) {
        return this._instance.attack(target);
    }
    heal(target: SwarmCreep) {
        return this._instance.heal(target);
    }
    repair(target: Structure<StructureConstant>) {
        return this._instance.repair(target);
    }
    protected OnActivate() {
        console.log("Successfully activated a Tower");
    }
}
export function MakeSwarmTower(tower: StructureTower): ISwarmTower {
    return new SwarmTower(tower);
}