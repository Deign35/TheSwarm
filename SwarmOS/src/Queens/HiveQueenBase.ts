import * as _ from 'lodash';
import * as SwarmCodes from 'Consts/SwarmCodes'
import { NestQueenBase } from 'Queens/NestQueenBase';
import { SpawnConsul } from 'Consuls/SpawnConsul';
import { HarvestConsul } from 'Consuls/HarvestConsul';
import { ControllerConsul } from 'Consuls/ControllerConsul';
import { ConstructionConsul } from 'Consuls/ConstructionConsul';
import { DistributionConsul } from 'Consuls/DistributionConsul';

export abstract class HiveQueenBase extends NestQueenBase implements IHiveQueen {
    Upgrader!: ControllerConsul;
    Spawner!: SpawnConsul;

    ReservedNests!: NestQueenBase[];
    Save() {
        this.Upgrader.Save();
        this.Spawner.Save();
        super.Save();
    }

    AssignIdleCreeps(idleCreeps: Creep[]) {
        for (let i = 0, length = idleCreeps.length; i < length; i++) {
            if (idleCreeps[i].getActiveBodyparts(WORK) == 0) {
                this.Distributor.AssignCreep(idleCreeps[i]);
                continue;
            }

            if (idleCreeps[i].getActiveBodyparts(WORK) > 1) {
                this.Collector.AssignCreep(idleCreeps[i]);
                continue;
            }

            if (this.Nest.find(FIND_MY_CONSTRUCTION_SITES)) {
                this.Builder.AssignCreep(idleCreeps[i]);
                continue;
            }

            this.Upgrader.AssignCreep(idleCreeps[i]);
        }
    }

    ActivateNest() {
        this.ValidateCounsel();
        this.ActivateCounsel();
        this.CheckForSpawnRequirements();
        let requirements = this.Spawner.GetNextSpawns(1);
        if (requirements.length > 0) {
            if (this.Nest.energyAvailable >= requirements[0].energyNeeded && requirements[0].neededBy) {
                let spawnedCreep = this.Spawner.SpawnCreep();
                if (spawnedCreep) {
                    if (spawnedCreep.requestorID == HarvestConsul.ConsulType) {
                        this.Collector.AssignSpawn(spawnedCreep.creepName);
                    } else if (spawnedCreep.requestorID == ControllerConsul.ConsulType) {
                        this.Upgrader.AssignSpawn(spawnedCreep.creepName);
                    } else if (spawnedCreep.requestorID == ConstructionConsul.ConsulType) {
                        this.Builder.AssignSpawn(spawnedCreep.creepName);
                    } else if (spawnedCreep.requestorID == DistributionConsul.ConsulType) {
                        this.Distributor.AssignSpawn(spawnedCreep.creepName);
                    }
                }
            }
        }
    }
    protected LoadNestCounsel() {
        this.CreepConsulList = [];
        this.Distributor = new DistributionConsul(DistributionConsul.ConsulType, this);
        this.CreepConsulList.push(this.Distributor);
        this.Collector = new HarvestConsul(HarvestConsul.ConsulType, this);
        this.CreepConsulList.push(this.Collector);
        this.Upgrader = new ControllerConsul(ControllerConsul.ConsulType, this);
        this.CreepConsulList.push(this.Upgrader);
        this.Builder = new ConstructionConsul(ConstructionConsul.ConsulType, this);
        this.CreepConsulList.push(this.Builder);

        this.Spawner = new SpawnConsul(SpawnConsul.ConsulType, this);
    }
    protected ValidateCounsel() {
        this.Spawner.ValidateConsulState();
        super.ValidateCounsel();
    }
    protected ActivateCounsel(): SwarmCodes.SwarmErrors {
        this.Collector.ActivateConsul();
        if (Game.cpu.bucket > 500 || Game.shard.name == 'sim') {
            this.Builder.ActivateConsul();
            this.Upgrader.ActivateConsul();
        }
        this.Distributor.ActivateConsul();
        return SwarmCodes.C_NONE;
    }
}