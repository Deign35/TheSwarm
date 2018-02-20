import * as SwarmCodes from 'Consts/SwarmCodes'
import { NestQueenBase } from "./NestQueenBase";
import { HarvestImperator } from "Imperators/HarvestImperator";
import { SpawnConsul } from 'Consuls/SpawnConsul';
import { HarvestConsul } from 'Consuls/HarvestConsul';
import { ControllerImperator } from 'Imperators/ControllerImperator';
import { ControllerConsul } from 'Consuls/ControllerConsul';
import { ConstructionConsul } from 'Consuls/ConstructionConsul';
import { ConstructionImperator } from 'Imperators/ConstructionImperator';
import * as _ from 'lodash';
import { SpawnImperator } from 'Imperators/SpawnImperator';

export abstract class HiveQueenBase extends NestQueenBase implements IHiveQueen {
    Collector!: HarvestImperator;
    Upgrader!: ControllerImperator;
    Builder!: ConstructionImperator;

    Spawner!: SpawnImperator;
    Save() {
        this.Upgrader.ImperatorComplete();
        this.Collector.ImperatorComplete();
        this.Builder.ImperatorComplete();
        this.Spawner.ImperatorComplete();
        super.Save();
    }

    InitMemory() {
        super.InitMemory();
    }

    ActivateNest() {
        debugger;
        // Check for idle creeps and reassign them
        this.ActivateImperators();
        this.CheckForSpawnRequirements();
        let requirements = this.Spawner.Consul.GetNextSpawns(3);
        for (let i = 0, length = requirements.length; i < length; i++) {
            if (this.Nest.energyAvailable >= requirements[i].energyNeeded && requirements[i].neededBy <= (Game.time - 3)) {
                let spawnedCreep = this.Spawner.Consul.SpawnCreep();
                if (spawnedCreep) {
                    if (spawnedCreep.requestorID == HarvestConsul.ConsulType) {
                        this.Collector.Consul.AssignSpawn(spawnedCreep.creepName);
                    } else if (spawnedCreep.requestorID == ControllerConsul.ConsulType) {
                        this.Upgrader.Consul.AssignSpawn(spawnedCreep.creepName);
                    } else if (spawnedCreep.requestorID == ConstructionConsul.ConsulType) {
                        this.Builder.Consul.AssignSpawn(spawnedCreep.creepName);
                    } else if(spawnedCreep.requestorID == SpawnConsul.ConsulType) {
                        this.Spawner.Consul.AssignSpawn(spawnedCreep.creepName);
                    }
                }
            }
        }
    }
    protected LoadImperators() {
        this.Spawner = new SpawnImperator(SpawnConsul.ConsulType, this);
        this.Collector = new HarvestImperator(HarvestConsul.ConsulType, this);
        this.Upgrader = new ControllerImperator(ControllerConsul.ConsulType, this);
        this.Builder = new ConstructionImperator(ConstructionConsul.ConsulType, this);
    }
    protected ActivateImperators(): SwarmCodes.SwarmErrors {
        this.Collector.ActivateImperator();
        this.Upgrader.ActivateImperator();
        this.Builder.ActivateImperator();
        return SwarmCodes.C_NONE;
    }
    protected abstract CheckForSpawnRequirements(): void;
}