import * as _ from 'lodash';
import * as SwarmCodes from 'Consts/SwarmCodes'
import { NestQueenBase } from 'Queens/NestQueenBase';
import { ControllerConsul } from 'Consuls/ControllerConsul';
import { ConstructionConsul } from 'Consuls/ConstructionConsul';
import { DistributionConsul } from 'Consuls/DistributionConsul';
import { NestJobs } from 'Consuls/NestJobs';
import { CalculateBodyCost } from 'Tools/QuickCalculations';
import { SpawnPriority } from 'Consts/SwarmConsts';

const ARBITRARY_SPAWN_CONSTANT = 100;
export abstract class HiveQueenBase extends NestQueenBase implements IHiveQueen {
    Distributor!: DistributionConsul;
    Upgrader!: ControllerConsul;
    Save() {
        this.Distributor.Save();
        this.Upgrader.Save();
        super.Save();
    }
    LoadNestCouncil() {
        this.Distributor = new DistributionConsul(DistributionConsul.ConsulType, this);
        this.CreepConsulList.push(this.Distributor);
        this.Upgrader = new ControllerConsul(ControllerConsul.ConsulType, this);
        this.CreepConsulList.push(this.Upgrader);
    }
    ActivateNest() {
        this.ActivateCouncil();
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
                let spawns = this.Nest.find(FIND_MY_SPAWNS);
                if (spawns.length == 0) {
                    console.log('All is lost Hive Queen ' + this.Nest.name + ' has lost a spawn!!!');
                    return; // YIKES
                }
                if (!spawns[0].spawning) {
                    let creepName = CreepCounter++ + '_' + nextSpawn.creepSuffix;
                    CreepCounter %= 10000;
                    let spawnResult = spawns[0].spawnCreep(nextSpawn.body, creepName);
                    if (spawnResult == OK) {
                        this.CreepConsulList[nextIndex].AssignCreep(creepName, nextSpawn.supplementalData);
                    }
                }
            }
        }
    }

    ActivateRequiredConsuls() {
        super.ActivateRequiredConsuls();
        this.Distributor.ActivateConsul();
    }
    ActivateSupportConsuls() {
        super.ActivateSupportConsuls();
        this.Upgrader.ActivateConsul();
    }
}