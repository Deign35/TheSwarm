import { SwarmMemory } from "Memory/SwarmMemory";
import * as SwarmEnums from "SwarmEnums";
import { HiveHarvestOverseer } from "Overseers/HiveHarvestOverseer";
import { DistributionOverseer } from "Overseers/DistributionOverseer";
import { SwarmLinkOverseer } from "Overseers/SwarmLinkOverseer";
import { ArchitectureOverseer } from "Overseers/ArchitectureOverseer";
import { ConstructionOverseer } from "Overseers/ConstructionOverseer";

const DISTRIBUTION = 'Di';
const HIVE_HARVESTER = 'HH';
const ARCHITECTURE = 'Ar';
const HIVELORD = 'HL';
const CONSTRUCTION = 'Ct';
const CREEP_DATA = 'CD';
const NO_ASSIGNMENT = 'NA';
export class HiveQueen extends SwarmMemory {
    Hive!: Room;
    Overseers!: IOverseer[];
    Distribution!: DistributionOverseer;
    HiveHarvester!: HiveHarvestOverseer;
    hivelord!: SwarmLinkOverseer;
    architectureOverseer!: ArchitectureOverseer;
    ConstructionOverseer!: ConstructionOverseer;

    protected CreepData!: { [creepName: string]: Hive_CreepData }

    Save() {
        this.architectureOverseer.Save();
        this.Distribution.Save();
        this.HiveHarvester.Save();
        this.hivelord.Save();
        this.ConstructionOverseer.Save();

        this.SetData(CREEP_DATA, this.CreepData);
        super.Save();
    }

    Load() {
        super.Load();
        this.Hive = Game.rooms[this.MemoryID];
        this.CreepData = this.GetData(CREEP_DATA) || {};
        this.hivelord = new SwarmLinkOverseer(HIVELORD, this); // Special overseer.  does not request/require things.
        this.Overseers = [];
        this.Distribution = new DistributionOverseer(DISTRIBUTION, this); // Special.  Must be init before all other overseers.

        this.HiveHarvester = new HiveHarvestOverseer(HIVE_HARVESTER, this);
        this.Overseers.push(this.HiveHarvester);
        this.Overseers.push(this.Distribution);
        this.architectureOverseer = new ArchitectureOverseer(ARCHITECTURE, this);
        this.Overseers.push(this.architectureOverseer);
        this.ConstructionOverseer = new ConstructionOverseer(CONSTRUCTION, this);
        this.Overseers.push(this.ConstructionOverseer);

        // Revalidate
        for (let i = 0, length = this.Overseers.length; i < length; i++) {
            this.Overseers[i].ValidateOverseer();
        }
    }

    Activate() {
        let spawned = false;
        for (let i = 0, length = this.Overseers.length; i < length; i++) {
            let requirements = this.Overseers[i].GetRequirements();
            if (!spawned && requirements.Creeps.length > 0) {
                let spawns = this.hivelord.FindTargets<STRUCTURE_SPAWN>(FIND_STRUCTURES, 10000, STRUCTURE_SPAWN) as StructureSpawn[];
                if (spawns.length > 0 && spawns[0].spawnCreep(requirements.Creeps[0].creepBody, 'TEST_SPAWN', { dryRun: true }) == OK) {
                    let newSpawnName = this.MemoryID + '_' + ('' + Game.time).slice(-4);
                    spawns[0].spawnCreep(requirements.Creeps[0].creepBody, newSpawnName, { memory: { Assigned: 'HiveHarvestOverseer' } });
                    this.Overseers[i].AssignCreep(newSpawnName);
                    spawned = true;

                    this.CreepData[newSpawnName] = { Assignment: this.Overseers[i].MemoryID };
                }
            }
            for (let j = 0, length = requirements.Resources.length; j < length; j++) {
                let resourceRequest = requirements.Resources[j];
                let newOrder = this.Distribution.CreateNewDistributionOrder(resourceRequest.location as Structure, resourceRequest.type, resourceRequest.amount);
                if (newOrder) {
                    if (!this.Overseers[i].AssignOrder(newOrder)) {
                        console.log('what?');
                        // Order didn't acquire correctly.
                        this.Distribution.CancelOrder(newOrder);
                    }
                }
            }
            this.Overseers[i].ActivateOverseer();
        }
    }

    GiveCreepToHive(creepName: string, forward: boolean = true) {
        if (this.CreepData[creepName] && forward) {
            let id = this.CreepData[creepName].Assignment;
            // forward the release to the appropriate overseer
            // Or all I guess....
            for (let i = 0, length = this.Overseers.length; i < length; i++) {
                this.Overseers[i].ReleaseCreep(creepName, 'Released');
            }
        }

        this.CreepData[creepName].Assignment = NO_ASSIGNMENT;
    }

    protected SpawnCreepForHivelord(requirements: IOverseerRequirements) {
        // Look for existing??
        // Try to spawn here...Add multiple spawns when I get there.
        let spawn = this.hivelord.FindTarget((this.Hive.controller as StructureController).pos, FIND_MY_SPAWNS) as StructureSpawn;
        if (spawn && !spawn.spawning && spawn.spawnCreep(requirements.Creeps[0].creepBody, 'TEST_SPAWN', { dryRun: true }) == OK) {
            let newSpawnName = this.MemoryID + '_' + ('' + Game.time).slice(-4);
            spawn.spawnCreep(requirements.Creeps[0].creepBody, newSpawnName, { memory: { Assigned: 'HiveHarvestOverseer' } });
            return newSpawnName;
        }
        return;
    }
}