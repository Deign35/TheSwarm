import * as SwarmCodes from 'Consts/SwarmCodes'
import { NestQueenBase } from "./NestQueenBase";
import { HarvestImperator } from "Imperators/HarvestImperator";
import { SpawnConsul } from 'Consuls/SpawnConsul';

const HARVEST_IMPERATOR_ID = 'HARVEST';
const SPAWNER_ID = 'SPAWNER';
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
                if (spawnedCreep.requestorID == HARVEST_IMPERATOR_ID) {
                    this.Collector.AssignCreep(spawnedCreep.creepName);
                }
            }
        }
    }
    protected LoadImperators() {
        this.Spawner = new SpawnConsul(SPAWNER_ID, this);
        this.Collector = new HarvestImperator(HARVEST_IMPERATOR_ID, this);
    }
    protected ActivateImperators(): SwarmCodes.SwarmErrors {
        this.Collector.ActivateImperator();
        return SwarmCodes.C_NONE;
    }
    protected abstract CheckForSpawnRequirements(): void;
}