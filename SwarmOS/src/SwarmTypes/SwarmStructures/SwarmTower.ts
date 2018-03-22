import { OwnedSwarmStructure, SwarmStructure } from "./SwarmStructure";
import { StructureMemory } from "SwarmMemory/StorageMemory";
import { profile } from "Tools/Profiler";
import { SwarmCreep } from "SwarmTypes/SwarmCreep";

@profile
export class SwarmTower extends OwnedSwarmStructure<SwarmType.SwarmTower, STRUCTURE_TOWER, StructureTower>
    implements ISwarmTower, StructureTower {


    get SwarmType(): SwarmType.SwarmTower { return SwarmType.SwarmTower; }
    get energy() { return this._instance.energy; }
    get energyCapacity() { return this._instance.energyCapacity; }

    attack(target: SwarmCreep) {
        return this._instance.attack(target);
    }
    heal(target: SwarmCreep) {
        return this._instance.heal(target);
    }
    repair(target: SwarmStructure<SwarmStructureType, StructureConstant, Structure>) {
        return this._instance.repair(target);
    }
    protected OnActivate() {
        console.log("Successfully activated a Tower");
    }
}