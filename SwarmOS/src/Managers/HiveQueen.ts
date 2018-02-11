import { SwarmMemory } from "Memory/SwarmMemory";
import * as SwarmEnums from "SwarmEnums";
import { HiveHarvestOverseer } from "Overseers/HiveHarvestOverseer";
import { DistributionOverseer } from "Overseers/DistributionOverseer";
import { SwarmLinkOverseer } from "Overseers/SwarmLinkOverseer";
import { ArchitectureOverseer } from "Overseers/ArchitectureOverseer";

const DISTRIBUTION = 'Di';
const HIVE_HARVESTER = 'HH';
const ARCHITECTURE = 'Ar';
const HIVELORD = 'HL';
export class HiveQueen extends SwarmMemory {
    Hive: Room;
    Overseers: IOverseer[];
    Distribution: DistributionOverseer;
    HiveHarvester: HiveHarvestOverseer;
    hivelord: SwarmLinkOverseer;
    architectureOverseer: ArchitectureOverseer;

    Save() {
        this.architectureOverseer.Save();
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

        this.HiveHarvester = new HiveHarvestOverseer(HIVE_HARVESTER, this);
        this.Overseers.push(this.HiveHarvester);
        this.Distribution = new DistributionOverseer(DISTRIBUTION, this);
        this.Overseers.push(this.Distribution);
        this.architectureOverseer = new ArchitectureOverseer(ARCHITECTURE, this);
        this.Overseers.push(this.architectureOverseer);
    }

    Activate() {
        let spawns: StructureSpawn[] | undefined;
        let spawnIndex = -1;
        for (let i = 0, length = this.Overseers.length; i < length; i++) {
            let requirements = this.Overseers[i].GetRequirements();
            if (requirements.Creeps.length > 0) {
                if (!spawns) {
                    spawns = this.hivelord.FindTargets(FIND_MY_SPAWNS) as StructureSpawn[];
                    spawnIndex = spawns.length - 1;
                }
                let spawn: StructureSpawn | undefined = spawns ? spawns[spawnIndex] : undefined;
                while (!spawn && spawnIndex >= 0) {
                    if (!spawns[spawnIndex] || spawns[spawnIndex].spawning) {
                        spawnIndex--;
                    } else {
                        spawn = spawns[spawnIndex];
                    }
                }
                if (spawn && spawn.spawnCreep(requirements.Creeps[0].creepBody, 'TEST_SPAWN', { dryRun: true }) == OK) {
                    let newSpawnName = this.MemoryID + '_' + ('' + Game.time).slice(-4);
                    spawn.spawnCreep(requirements.Creeps[0].creepBody, newSpawnName, { memory: { Assigned: 'HiveHarvestOverseer' } });
                    this.Overseers[i].AssignCreep(newSpawnName);
                    spawnIndex--;
                }
            }
            for (let j = 0, length = requirements.Resources.length; j < length; j++) {
                let resourceRequest = requirements.Resources[j];
                let newOrder = this.Distribution.CreateNewDistributionOrder(resourceRequest.location as Structure, resourceRequest.type, resourceRequest.amount);
                if (newOrder) {
                    if (!this.Overseers[i].AssignOrder(newOrder)) {
                        // Order didn't acquire correctly.
                        this.Distribution.CancelOrder(newOrder.orderID);
                    }
                }
            }
            this.Overseers[i].ActivateOverseer();
            this.Overseers[i].Save();
            this.Overseers[i].Load();
        }
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