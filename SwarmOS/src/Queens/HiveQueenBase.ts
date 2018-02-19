import * as SwarmCodes from 'Consts/SwarmCodes'
import { NestQueenBase } from "./NestQueenBase";
import { HarvestImperator } from "Imperators/HarvestImperator";
import { SpawnConsul } from 'Consuls/SpawnConsul';
import { HarvestConsul } from 'Consuls/HarvestConsul';
import { ControllerImperator } from 'Imperators/ControllerImperator';
import { ControllerConsul } from 'Consuls/ControllerConsul';

export abstract class HiveQueenBase extends NestQueenBase implements IHiveQueen {
    Collector!: HarvestImperator;
    Upgrader!: ControllerImperator;

    Spawner!: SpawnConsul;
    Save() {
        this.Upgrader.ImperatorComplete();
        this.Collector.ImperatorComplete();
        this.Spawner.Save();
        super.Save();
    }

    ActivateNest() {
        this.ActivateImperators();
        this.CheckForSpawnRequirements();
        let requirements = this.Spawner.RequiresSpawn();
        for(let i = 0, length = requirements.length; i < length; i++) {
            if(this.Nest.energyAvailable >= requirements[i].energyNeeded && requirements[i].neededBy <= (Game.time - 3)) {
                let spawnedCreep = this.Spawner.SpawnCreep();
                if(spawnedCreep) {
                    if (spawnedCreep.requestorID == HarvestConsul.ConsulType) {
                        this.Collector.AssignCreep(spawnedCreep);
                    } else if(spawnedCreep.requestorID == ControllerConsul.ConsulType) {
                        this.Upgrader.Consul.AssignCreep(spawnedCreep);
                    }
                }
            }
        }
    }

    ReturnCreep(creep: Creep) {

    }

    protected LoadImperators() {
        this.Spawner = new SpawnConsul(SpawnConsul.ConsulType, this);
        this.Collector = new HarvestImperator(HarvestConsul.ConsulType, this);
        this.Upgrader = new ControllerImperator(ControllerConsul.ConsulType, this);
    }
    protected ActivateImperators(): SwarmCodes.SwarmErrors {
        this.Collector.ActivateImperator();
        this.Upgrader.ActivateImperator();
        return SwarmCodes.C_NONE;
    }
    protected abstract CheckForSpawnRequirements(): void;
}