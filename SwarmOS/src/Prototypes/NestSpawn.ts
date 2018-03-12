import { OwnedSwarmStructure } from "Prototypes/SwarmStructure";
import { NotImplementedException } from "Tools/SwarmExceptions";
import { SwarmCreep } from "./SwarmCreep";

export class NestNuker extends OwnedSwarmStructure<StructureSpawn> {
    get energy() { return this._instance.energy; }
    get energyCapacity() { return this._instance.energyCapacity; }
    get name() { return this._instance.name; }
    get spawning() { return this._instance.spawning; }
    get memory() {
        //return this._instance.memory;
        throw new NotImplementedException('Spawn memory is not hooked up');
    }

    spawnCreep(body: BodyPartConstant[], name: string,
        opts?: {
            memory?: CreepData,
            energyStructures?: Array<(StructureSpawn | StructureExtension)>,
            dryRun?: boolean,
            directions?: DirectionConstant[]
        }) { return this._instance.spawnCreep(body, name, opts); }
    recycleCreep(target: SwarmCreep) { return this._instance.recycleCreep(target.Value); }
    renewCreep(target: SwarmCreep) { return this._instance.renewCreep(target.Value); }
}