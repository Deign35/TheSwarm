import * as SwarmCodes from 'Consts/SwarmCodes'
import { NestQueenBase } from "./NestQueenBase";
import { HarvestImperator } from "Imperators/HarvestImperator";
import { SpawnConsul } from 'Consuls/SpawnConsul';
import { HarvestConsul } from 'Consuls/HarvestConsul';
import { ControllerImperator } from 'Imperators/ControllerImperator';
import { ControllerConsul } from 'Consuls/ControllerConsul';
import { ConstructionConsul } from 'Consuls/ConstructionConsul';
import { ConstructionImperator } from 'Imperators/ConstructionImperator';

export abstract class HiveQueenBase extends NestQueenBase implements IHiveQueen {
    Collector!: HarvestImperator;
    Upgrader!: ControllerImperator;
    Builder!: ConstructionImperator;

    Spawner!: SpawnConsul;
    Save() {
        this.Upgrader.ImperatorComplete();
        this.Collector.ImperatorComplete();
        this.Builder.ImperatorComplete();
        this.Spawner.Save();
        super.Save();
    }

    ActivateNest() {
        this.ActivateImperators();
        this.CheckForSpawnRequirements();
        let requirements = this.Spawner.RequiresSpawn();
        for (let i = 0, length = requirements.length; i < length; i++) {
            if (this.Nest.energyAvailable >= requirements[i].energyNeeded && requirements[i].neededBy <= (Game.time - 3)) {
                let spawnedCreep = this.Spawner.SpawnCreep();
                if (spawnedCreep) {
                    if (spawnedCreep.requestorID == HarvestConsul.ConsulType) {
                        this.Collector.Consul.AssignCreep(spawnedCreep);
                    } else if (spawnedCreep.requestorID == ControllerConsul.ConsulType) {
                        this.Upgrader.Consul.AssignCreep(spawnedCreep);
                    } else if (spawnedCreep.requestorID == ConstructionConsul.ConsulType) {
                        this.Builder.Consul.AssignCreep(spawnedCreep);
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
        this.Builder = new ConstructionImperator(ConstructionConsul.ConsulType, this);
    }
    protected ActivateImperators(): SwarmCodes.SwarmErrors {
        this.Collector.Consul.ScanRoom();
        this.Collector.ActivateImperator();
        this.Upgrader.ActivateImperator();
        this.Builder.ActivateImperator();
        return SwarmCodes.C_NONE;
    }
    protected abstract CheckForSpawnRequirements(): void;
}