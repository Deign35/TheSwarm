import * as _ from 'lodash';
import * as SwarmCodes from 'Consts/SwarmCodes'
import { NestQueenBase } from 'Queens/NestQueenBase';
import { ControllerConsul } from 'Consuls/ControllerConsul';
import { ConstructionConsul } from 'Consuls/ConstructionConsul';
import { DistributionConsul } from 'Consuls/DistributionConsul';
import { NestJobs } from 'Consuls/NestJobs';
import { CalculateBodyCost } from 'Tools/QuickCalculations';

const SPAWNING_POOL = 'S_POOL';
const SPAWN_DATA = 'S_DATA';
export abstract class HiveQueenBase extends NestQueenBase implements IHiveQueen {
    protected Spawns!: string[]
    Load() {
        if (!super.Load()) { return false; }
        this.Spawns = this.GetData(SPAWN_DATA);
        return true;
    }
    InitializeNest() {
        let spawns = this.Nest.find(FIND_MY_SPAWNS);
        let spawnIDs = [];
        for (let i = 0, length = spawns.length; i < length; i++) {
            spawnIDs.push(spawns[i].id);
        }
        this.SetData(SPAWN_DATA, spawnIDs);
    }

    ActivateNest() {
        this.ValidateCouncil();
        this.ActivateCouncil();
        this.CheckForSpawnRequirements();
        let nextJobs = this.JobBoard.DetermineNextJobs(3, this.Nest.energyAvailable);
        let spawnIndex = 0;
        for (let i = 0; i < nextJobs.length; i++) {
            if (this.Spawns.length <= spawnIndex) {
                break;
            }
            let job = nextJobs[i];
            if (CalculateBodyCost(nextJobs[i].body) <= this.Nest.energyAvailable) {
                if (this.Spawns.length > spawnIndex) {
                    let spawn = Game.getObjectById(this.Spawns[spawnIndex]) as StructureSpawn;
                    if (!spawn) {
                        console.log('All is lost Hive Queen ' + this.Nest.name + ' has lost a spawn!!!');
                        this.Spawns.shift();
                        continue; // YIKES
                    }
                    if (spawn.spawning) {
                        spawnIndex++;
                    } else {
                        let creepMem = job.initMemory || {};
                        let creepName = CreepCounter++ + '_' + job.creepSuffix;
                        spawn.spawnCreep(job.body, creepName, { memory: creepMem });
                        CreepCounter %= 10000;
                        for (let i = 0, length = this.CreepConsulList.length; i < length; i++) {
                            if (this.CreepConsulList[i].consulType == job.requestor) {
                                this.CreepConsulList[i].AssignCreep(creepName, job.requestID);
                                job.targetTime = (job.targetTime || 0) + 1450;
                                this.JobBoard.AddOrUpdateJobPosting(job);
                                spawnIndex++;
                                break;
                            }
                        }
                    }
                }
            }
        }
    }
    protected ValidateCouncil() {
        super.ValidateCouncil();
    }
    protected ActivateSupportConsuls() {
        super.ActivateSupportConsuls();
    }
}