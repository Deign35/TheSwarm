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
        let unassignedCreeps: string[] = [];
        for (let name in this.CreepData) {
            if (!this.CreepData[name].Assignment) {
                unassignedCreeps.push(name);
            }
        }
        for (let i = 0, length = this.Overseers.length; i < length; i++) {
            let requirements = this.Overseers[i].GetRequirements();
            if (requirements.Creeps.length > 0) { // Overseer needs creeps
                let needsSpawn = !spawned;
                if (unassignedCreeps.length > 0) { // Check unassigned creeps first.
                    let bestPick = -1;
                    let bestBodyMatch = 0;
                    let desiredBody = requirements.Creeps[i].creepBody;
                    for (let k = 0, length2 = unassignedCreeps.length; k < length2; k++) {
                        if (this.CanCreepFillRole(Game.creeps[unassignedCreeps[i]], desiredBody)) {
                            let newBody = Game.creeps[unassignedCreeps[i]].body;

                            let newScore = this.CompareBodyToTemplate(newBody, desiredBody);
                            if (newScore > bestBodyMatch) {
                                bestPick = k;
                            }
                        }
                    }
                    if (bestPick >= 0) {
                        // bestpick is now the best creep to bestBodyMatch
                        this.Overseers[i].AssignCreep(unassignedCreeps[bestPick]);
                        this.CreepData[unassignedCreeps[bestPick]].Assignment = this.Overseers[i].MemoryID;
                        unassignedCreeps.splice(bestPick, 1);
                        needsSpawn = false;
                    }
                }

                if (needsSpawn) {
                    let creepName = this.SpawnCreepForHivelord(requirements, this.Overseers[i].MemoryID);
                    if (creepName) {
                        //got a spawn
                        spawned = true;
                        this.Overseers[i].AssignCreep(creepName);
                        this.CreepData[creepName].Assignment = this.Overseers[i].MemoryID;
                    }
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

    protected SpawnCreepForHivelord(requirements: IOverseerRequirements, assignmentID: string) {
        // Look for existing??
        // Try to spawn here...Add multiple spawns when I get there.
        let spawn = this.hivelord.FindTarget((this.Hive.controller as StructureController).pos, FIND_MY_SPAWNS) as StructureSpawn;
        if (spawn && !spawn.spawning && spawn.spawnCreep(requirements.Creeps[0].creepBody, 'TEST_SPAWN', { dryRun: true }) == OK) {
            let newSpawnName = this.MemoryID + '_' + ('' + Game.time).slice(-4);
            spawn.spawnCreep(requirements.Creeps[0].creepBody, newSpawnName, { memory: { Assigned: assignmentID } });
            return newSpawnName;
        }
        return;
    }

    CompareBodyToTemplate(bodyToCompare: BodyPartDefinition[], desiredBody: BodyPartConstant[]): number {
        let score = 0;

        return score;
    }
    CanCreepFillRole(creep: Creep, desiredBody: BodyPartConstant[]): boolean {
        return false;
    }
}