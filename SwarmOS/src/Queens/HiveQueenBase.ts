import * as SwarmCodes from 'Consts/SwarmCodes'
import { NestQueenBase } from "./NestQueenBase";
import { HarvestImperator } from "Imperators/HarvestImperator";
import { SpawnConsul } from 'Consuls/SpawnConsul';
import { HarvestConsul } from 'Consuls/HarvestConsul';

export abstract class HiveQueenBase extends NestQueenBase implements IHiveQueen {
    Collector!: HarvestImperator;
    Spawner!: SpawnConsul;
    Save() {
        this.Collector.ImperatorComplete();
        this.Spawner.Save();
        super.Save();
    }

    ActivateNest() {
        this.ActivateImperators();
        this.CheckForSpawnRequirements();
        let requirements = this.Spawner.DetermineRequirements();
        if (this.Nest.energyAvailable >= requirements.energyNeeded && requirements.neededBy <= (Game.time - 3)) { // 3 tick buffer??
            let spawnedCreep = this.Spawner.SpawnCreep();
            if (spawnedCreep) {
                if (spawnedCreep.requestorID == HarvestConsul.ConsulType) {
                    this.Collector.AssignCreep(spawnedCreep.creepName);
                }
                // Other imperators should go here.
            }
        }
    }

    ReturnCreep(creep: Creep) {

    }

    protected LoadImperators() {
        this.Spawner = new SpawnConsul(SpawnConsul.ConsulType, this);
        this.Collector = new HarvestImperator(HarvestConsul.ConsulType, this);
    }
    protected ActivateImperators(): SwarmCodes.SwarmErrors {
        this.Collector.ActivateImperator();
        return SwarmCodes.C_NONE;
    }
    protected abstract CheckForSpawnRequirements(): void;
}