import { NotImplementedException } from "Tools/SwarmExceptions";
import { SwarmCreep } from "../SwarmCreep";
import { OwnedSwarmStructure } from "./SwarmStructure";
import { profile } from "Tools/Profiler";
import { StructureMemory } from "Memory/StorageMemory";

@profile
export class SwarmSpawn extends OwnedSwarmStructure<SwarmType.SwarmSpawn, STRUCTURE_SPAWN, StructureSpawn> implements ISwarmSpawn, StructureSpawn {
    get SwarmType(): SwarmType.SwarmSpawn { return SwarmType.SwarmSpawn; }
    get energy() { return this._instance.energy; }
    get energyCapacity() { return this._instance.energyCapacity; }
    get name() { return this._instance.name; }
    get spawning() { return this._instance.spawning; }
    get Spawning() { return this._instance.Spawning; }
    get memory() {
        return this._instance.memory;
        //throw new NotImplementedException('Spawn memory is not hooked up');
    }

    spawnCreep(body: BodyPartConstant[], name: string,
        opts?: {
            memory?: ICreepMemory,
            energyStructures?: Array<(StructureSpawn | StructureExtension)>,
            dryRun?: boolean,
            directions?: DirectionConstant[]
        }) { return this._instance.spawnCreep(body, name, opts); }
    recycleCreep(target: SwarmCreep) { return this._instance.recycleCreep(target); }
    renewCreep(target: SwarmCreep) { return this._instance.renewCreep(target); }
    protected OnActivate() {
        console.log("Successfully activated a Spawn");
    }
}