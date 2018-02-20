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
        // Check for idle creeps and reassign them
        let idleCreeps: Creep[] = [];
        for(let creepName in Game.creeps) {
            let creepFound = false;
            for(let i = 0, length = this.Upgrader.Consul.UpgradeCreepData.length; i < length; i++) {
                if(this.Upgrader.Consul.UpgradeCreepData[i].creepName == creepName) {
                    creepFound = true;
                    break;
                }
            }
            if(creepFound) { continue;}
            for(let i = 0, length = this.Collector.Consul.SourceData.length; i < length; i++) {
                if(this.Collector.Consul.SourceData[i].harvester == creepName) {
                    creepFound = true;
                    break;
                }
            }
            if(creepFound) { continue;}
            for(let i = 0, length = this.Builder.Consul.BuilderData.length; i < length; i++) {
                if(this.Builder.Consul.BuilderData[i].creepName == creepName) {
                    creepFound = true;
                    break;
                }
            }
            if(creepFound) { continue;}
            if(this.Spawner.Consul.RefillerData.creepName == creepName) {
                continue;
            }
            idleCreeps.push(Game.creeps[creepName]);
        }

        for(let i = 0, length = idleCreeps.length; i < length; i++) {
            if(idleCreeps[i].getActiveBodyparts(WORK) == 0) {
                if(!this.Spawner.Consul.RefillerData.creepName) {
                    this.Spawner.Consul.AssignCreep(idleCreeps[i]);
                    continue;
                }
                // What to do with this?
                idleCreeps[i].suicide();
                continue;
            }

            if(this.Nest.find(FIND_MY_CONSTRUCTION_SITES)) {
                this.Builder.Consul.AssignCreep(idleCreeps[i]);
                continue;
            }

            if(idleCreeps[i].getActiveBodyparts(WORK) >= 5) {
                this.Collector.Consul.AssignCreep(idleCreeps[i]);
                continue;
            }

            this.Upgrader.Consul.AssignCreep(idleCreeps[i]);
        }
        this.ActivateImperators();
        this.CheckForSpawnRequirements();
        let requirements = this.Spawner.Consul.GetNextSpawns(1);
        if(requirements.length > 0) {
            if (this.Nest.energyAvailable >= requirements[0].energyNeeded && requirements[0].neededBy) {
                let spawnedCreep = this.Spawner.Consul.SpawnCreep();
                if (spawnedCreep) {
                    if (spawnedCreep.requestorID == HarvestConsul.ConsulType) {
                        this.Collector.Consul.AssignSpawn(spawnedCreep.creepName);
                    } else if (spawnedCreep.requestorID == ControllerConsul.ConsulType) {
                        this.Upgrader.Consul.AssignSpawn(spawnedCreep.creepName);
                    } else if (spawnedCreep.requestorID == ConstructionConsul.ConsulType) {
                        this.Builder.Consul.AssignSpawn(spawnedCreep.creepName);
                    } else if (spawnedCreep.requestorID == SpawnConsul.ConsulType) {
                        this.Spawner.Consul.AssignSpawn(spawnedCreep.creepName);
                    }
                }
            }
        }
    }
    protected LoadImperators() {
        this.Collector = new HarvestImperator(HarvestConsul.ConsulType, this);
        this.Upgrader = new ControllerImperator(ControllerConsul.ConsulType, this);
        this.Builder = new ConstructionImperator(ConstructionConsul.ConsulType, this);
        this.Spawner = new SpawnImperator(SpawnConsul.ConsulType, this);
    }
    protected ActivateImperators(): SwarmCodes.SwarmErrors {
        this.Collector.ActivateImperator();
        if(Game.cpu.bucket > 500) {
            this.Upgrader.ActivateImperator();
            this.Builder.ActivateImperator();
        }
        this.Spawner.ActivateImperator();
        return SwarmCodes.C_NONE;
    }
    protected abstract CheckForSpawnRequirements(): void;
}