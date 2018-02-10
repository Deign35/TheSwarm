import { SwarmMemory } from "Memory/SwarmMemory";
import * as SwarmEnums from "SwarmEnums";
import { HiveHarvestOverseer } from "Overseers/HiveHarvestOverseer";
import { DistributionOverseer } from "Overseers/DistributionOverseer";
import { SwarmLinkOverseer } from "Overseers/SwarmLinkOverseer";

const DISTRIBUTION = 'Di';
const HIVE_HARVESTER = 'HH';
const HIVELORD = 'HL';
export class HiveQueen extends SwarmMemory {
    Hive: Room;
    Overseers: IOverseer[];
    Distribution: DistributionOverseer;
    HiveHarvester: HiveHarvestOverseer;
    hivelord: SwarmLinkOverseer;

    Save() {
        this.Distribution.Save();
        this.HiveHarvester.Save();
        this.hivelord.Save();
        super.Save();
    }

    Load() {
        super.Load();
        this.Hive = Game.rooms[this.MemoryID];
        this.hivelord = new SwarmLinkOverseer(HIVELORD, this); // Special overseer.  does not request/require things.
        this.Overseers = [];

        this.Distribution = new DistributionOverseer(DISTRIBUTION, this);
        this.Overseers.push(this.Distribution);
        this.HiveHarvester = new HiveHarvestOverseer(HIVE_HARVESTER, this);
        this.Overseers.push(this.HiveHarvester);
    }

    Activate() {
        for (let i = 0, length = this.Overseers.length; i < length; i++) {
            let requirements = this.Overseers[i].GetRequirements();
            if (requirements.Creeps.length > 0) {
                // Look for existing??
                // Try to spawn here...Add multiple spawns when I get there.
                let spawn = this.hivelord.FindTarget((this.Hive.controller as StructureController).pos, FIND_MY_SPAWNS) as StructureSpawn;
                if (spawn && !spawn.spawning && spawn.spawnCreep(requirements.Creeps[0].creepBody, 'TEST_SPAWN', { dryRun: true }) == OK) {
                    let newSpawnName = this.MemoryID + '_' + ('' + Game.time).slice(-4);
                    spawn.spawnCreep(requirements.Creeps[0].creepBody, newSpawnName, { memory: { Assigned: 'HiveHarvestOverseer' } })
                    this.Overseers[i].AssignCreep(newSpawnName);
                }
            }
            if(requirements.Resources.length > 0) {
                this.HiveHarvester.GetAvailableResources();
                // find one that has the needed amount of resources and type.
                this.Distribution.
            }
            this.Overseers[i].ActivateOverseer();
        }
    }
}