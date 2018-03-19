import { OwnedSwarmStructure, SwarmStructure } from "./SwarmStructure";
import { StructureMemory } from "Memory/StorageMemory";
import { profile } from "Tools/Profiler";
import { SwarmCreep } from "SwarmTypes/SwarmCreep";

@profile
export class SwarmTower extends OwnedSwarmStructure<SwarmType.SwarmTower, StructureTower, STRUCTURE_TOWER> implements ISwarmTower, StructureTower {
    get swarmType(): SwarmType.SwarmTower { return SwarmType.SwarmTower; }
    get energy() { return this._instance.energy; }
    get energyCapacity() { return this._instance.energyCapacity; }

    attack(target: SwarmCreep) {
        return this._instance.attack(target.value);
    }
    heal(target: SwarmCreep) {
        return this._instance.heal(target.value);
    }
    repair<T extends SwarmType, U extends Structure<V>, V extends StructureConstant>(target: SwarmStructure<T, U, V>) {
        return this._instance.repair(target.value);
    }
    protected OnActivate() {
        console.log("Successfully activated a Tower");
    }
}
export function MakeSwarmTower(tower: StructureTower): TSwarmTower {
    return new SwarmTower(tower);
}