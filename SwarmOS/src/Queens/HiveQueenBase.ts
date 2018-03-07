import * as _ from 'lodash';
import * as SwarmCodes from 'Consts/SwarmCodes'
import { NestQueenBase } from 'Queens/NestQueenBase';
import { ControllerConsul } from 'Consuls/ControllerConsul';
import { ConstructionConsul } from 'Consuls/ConstructionConsul';
import { DistributionConsul } from 'Consuls/DistributionConsul';
import { NestJobs } from 'Consuls/NestJobs';
import { CalculateBodyCost } from 'Tools/QuickCalculations';
import { SpawnPriority } from 'Consts/SwarmConsts';

const SPAWNING_POOL = 'S_POOL';
const SPAWN_DATA = 'S_DATA';
const ARBITRARY_SPAWN_CONSTANT = 100;
export abstract class HiveQueenBase extends NestQueenBase implements IHiveQueen {
    protected Spawns!: string[];
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

        let creepsFoundInRoom = this.Nest.find(FIND_MY_CREEPS);
        if (creepsFoundInRoom.length == 0) {
            let sources = this.Nest.find(FIND_SOURCES);
            this.JobBoard.AddOrUpdateJobPosting({
                priority: SpawnPriority.EMERGENCY,
                body: [WORK, CARRY, MOVE],
                creepSuffix: 'Number0',
                requestID: 'req1',
                requestor: this.Distributor.consulType,
                supplementalData: 'S_R'
            });

            for (let i = 0; i < sources.length; i++) {
                this.JobBoard.AddOrUpdateJobPosting({
                    priority: SpawnPriority.Highest,
                    body: [WORK, WORK, CARRY, MOVE],
                    creepSuffix: 'Number' + (1 + i),
                    requestID: 'req' + (1 + i),
                    requestor: this.Collector.consulType,
                    supplementalData: i
                });
            }
        }
    }

    ActivateNest() {
        this.ValidateCouncil();
        this.ActivateCouncil();
        debugger;
        let nextSpawnTime = Game.time + ARBITRARY_SPAWN_CONSTANT;
        let nextIndex = -1;
        for (let i = 0, length = this.CreepConsulList.length; i < length; i++) {
            //this.CreepConsulList[i].GetDefaultJobCo
            let next = this.CreepConsulList[i].GetNextSpawnTime();
            if (next != 0 && next < nextSpawnTime) {
                if (nextIndex < 0 || this.CreepConsulList[i].GetSpawnPriority() > this.CreepConsulList[nextIndex].GetSpawnPriority()) {
                    nextSpawnTime = next;
                    nextIndex = i;
                }
            }
        }

        if (nextSpawnTime < Game.time + ARBITRARY_SPAWN_CONSTANT) {
            let nextSpawn = this.CreepConsulList[nextIndex].CreateDefaultJobTemplate('' + Game.time);
            if (this.Nest.energyAvailable >= CalculateBodyCost(nextSpawn.body)) {
                let spawn = Game.getObjectById(this.Spawns[0]) as StructureSpawn;
                if (!spawn) {
                    console.log('All is lost Hive Queen ' + this.Nest.name + ' has lost a spawn!!!');
                    this.Spawns.shift();
                    return; // YIKES
                }
                if (!spawn.spawning) {
                    let creepName = CreepCounter++ + '_' + nextSpawn.creepSuffix;
                    CreepCounter %= 10000;
                    let spawnResult = spawn.spawnCreep(nextSpawn.body, creepName);
                    if (spawnResult == OK) {
                        this.CreepConsulList[nextIndex].AssignCreep(creepName, nextSpawn.supplementalData);
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