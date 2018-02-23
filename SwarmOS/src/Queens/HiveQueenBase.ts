import * as _ from 'lodash';
import * as SwarmCodes from 'Consts/SwarmCodes'
import { NestQueenBase } from 'Queens/NestQueenBase';
import { ControllerImperator } from 'Imperators/ControllerImperator';
import { SpawnConsul } from 'Consuls/SpawnConsul';
import { HarvestConsul } from 'Consuls/HarvestConsul';
import { ControllerConsul } from 'Consuls/ControllerConsul';
import { ConstructionConsul } from 'Consuls/ConstructionConsul';
import { DistributionConsul } from 'Consuls/DistributionConsul';
import { HarvestImperator } from 'Imperators/HarvestImperator';
import { ConstructionImperator } from 'Imperators/ConstructionImperator';
import { DistributionImperator } from 'Imperators/DistributionImperator';

export abstract class HiveQueenBase extends NestQueenBase implements IHiveQueen {
    Upgrader!: ControllerImperator;
    Spawner!: SpawnConsul;


    Save() {
        this.Upgrader.ImperatorComplete();
        this.Spawner.Save();
        super.Save();
    }

    AssignIdleCreeps(idleCreeps: Creep[]) {
        for (let i = 0, length = idleCreeps.length; i < length; i++) {
            if (idleCreeps[i].getActiveBodyparts(WORK) == 0) {
                if (!this.Distributor.Consul.SpawnRefillerData.creepName) {
                    this.Distributor.Consul.AssignCreep(idleCreeps[i]);
                    continue;
                }
                // What to do with this?
                idleCreeps[i].suicide();
                continue;
            }

            if (idleCreeps[i].getActiveBodyparts(WORK) > 1) {
                this.Collector.Consul.AssignCreep(idleCreeps[i]);
                continue;
            }

            if (this.Nest.find(FIND_MY_CONSTRUCTION_SITES)) {
                this.Builder.Consul.AssignCreep(idleCreeps[i]);
                continue;
            }

            this.Upgrader.Consul.AssignCreep(idleCreeps[i]);
        }
    }

    ActivateNest() {
        this.ActivateImperators();
        this.CheckForSpawnRequirements();
        let requirements = this.Spawner.GetNextSpawns(1);
        if (requirements.length > 0) {
            if (this.Nest.energyAvailable >= requirements[0].energyNeeded && requirements[0].neededBy) {
                let spawnedCreep = this.Spawner.SpawnCreep();
                if (spawnedCreep) {
                    if (spawnedCreep.requestorID == HarvestConsul.ConsulType) {
                        this.Collector.Consul.AssignSpawn(spawnedCreep.creepName);
                    } else if (spawnedCreep.requestorID == ControllerConsul.ConsulType) {
                        this.Upgrader.Consul.AssignSpawn(spawnedCreep.creepName);
                    } else if (spawnedCreep.requestorID == ConstructionConsul.ConsulType) {
                        this.Builder.Consul.AssignSpawn(spawnedCreep.creepName);
                    } else if (spawnedCreep.requestorID == DistributionConsul.ConsulType) {
                        this.Distributor.Consul.AssignSpawn(spawnedCreep.creepName);
                    }
                }
            }
        }
    }
    protected LoadImperators() {
        this.ImperatorList = []
        this.Spawner = new SpawnConsul(SpawnConsul.ConsulType, this);
        this.Collector = new HarvestImperator(HarvestConsul.ConsulType, this);
        this.ImperatorList.push(this.Collector);
        this.Upgrader = new ControllerImperator(ControllerConsul.ConsulType, this);
        this.ImperatorList.push(this.Upgrader);
        this.Builder = new ConstructionImperator(ConstructionConsul.ConsulType, this);
        this.ImperatorList.push(this.Builder);
        this.Distributor = new DistributionImperator(DistributionConsul.ConsulType, this);
        this.ImperatorList.push(this.Distributor);
    }
    protected ActivateImperators(): SwarmCodes.SwarmErrors {
        this.Collector.ActivateImperator();
        if (Game.cpu.bucket > 500 || Game.shard.name == 'sim') {
            this.Builder.ActivateImperator();
            this.Upgrader.ActivateImperator();
        }
        this.Distributor.ActivateImperator();
        return SwarmCodes.C_NONE;
    }
    FindIdleCreeps(): Creep[] {
        let curIdles = super.FindIdleCreeps();
        let idleCreeps: Creep[] = [];
        let creepFound = false;
        for(let i = 0, length = curIdles.length; i < length; i++) {
            let creepName = curIdles[i].name;
            for (let i = 0, length = this.Upgrader.Consul.CreepData.length; i < length; i++) {
                if (this.Upgrader.Consul.CreepData[i].creepName == creepName) {
                    creepFound = true;
                    break;
                }
            }
            if (creepFound) { continue; }
            idleCreeps.push(Game.creeps[creepName]);
        }
        return idleCreeps;
    }

    protected abstract CheckForSpawnRequirements(): void;
}