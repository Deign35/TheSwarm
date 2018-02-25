import * as _ from 'lodash';
import * as SwarmCodes from 'Consts/SwarmCodes'
import { NestQueenBase } from 'Queens/NestQueenBase';
import { SpawnConsul } from 'Consuls/SpawnConsul';
import { HarvestConsul } from 'Consuls/HarvestConsul';
import { ControllerConsul } from 'Consuls/ControllerConsul';
import { ConstructionConsul } from 'Consuls/ConstructionConsul';
import { DistributionConsul } from 'Consuls/DistributionConsul';

export abstract class HiveQueenBase extends NestQueenBase implements IHiveQueen {
    Spawner!: SpawnConsul;
    ReservedNests!: NestQueenBase[];
    Save() {
        this.Spawner.Save();
        super.Save();
    }

    ActivateNest() {
        this.ValidateCouncil();
        this.ActivateCouncil();
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
    protected LoadNestCouncil() {
        super.LoadNestCouncil();
        this.Spawner = new SpawnConsul(SpawnConsul.ConsulType, this);
    }
    protected ValidateCouncil() {
        this.Spawner.ValidateConsulState();
        super.ValidateCouncil();
    }
    protected ActivateSupportConsuls() {
        this.Upgrader.ActivateConsul();
        super.ActivateSupportConsuls();
    }
}