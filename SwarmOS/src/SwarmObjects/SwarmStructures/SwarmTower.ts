import { OwnedSwarmStructure, SwarmStructure } from "./SwarmStructure";
import { SwarmCreep } from "SwarmObjects/SwarmCreep";

export class SwarmTower extends OwnedSwarmStructure<STRUCTURE_TOWER, StructureTower, SwarmType.SwarmTower> implements ISwarmTower, StructureTower {
    get swarmType(): SwarmType.SwarmTower { return SwarmType.SwarmTower; }
    get energy() { return this._instance.energy; }
    get energyCapacity() { return this._instance.energyCapacity; }

    attack(target: SwarmCreep) {
        return this._instance.attack(target.Value);
    }
    heal(target: SwarmCreep) {
        return this._instance.heal(target.Value);
    }
    repair<U extends StructureConstant, T extends Structure<U>, V extends SwarmType>(target: SwarmStructure<U, T, V>) {
        return this._instance.repair(target.Value);
    }
}
export function MakeSwarmTower(tower: StructureTower): TSwarmTower { return new SwarmTower(tower); }