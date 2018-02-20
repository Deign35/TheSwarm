import * as SwarmCodes from "Consts/SwarmCodes";
import { HiveQueenBase } from "Queens/HiveQueenBase";
import { HarvestImperator } from "Imperators/HarvestImperator";
import { SpawnConsul } from "Consuls/SpawnConsul";
import { HarvestConsul } from "Consuls/HarvestConsul";
import * as _ from 'lodash';
import { ControllerConsul } from "Consuls/ControllerConsul";

export class BabyHiveQueen extends HiveQueenBase {
    protected CheckForSpawnRequirements(): void {
        if(this.Collector.Consul.CreepRequested) {
            if(!this.Spawner.Consul.ActiveSpawnNames[this.Collector.Consul.CreepRequested]) {
                this.Collector.Consul.ForgetSpawn();
            }
        }
        if(this.Upgrader.Consul.CreepRequested) {
            if(!this.Spawner.Consul.ActiveSpawnNames[this.Upgrader.Consul.CreepRequested]) {
                this.Upgrader.Consul.ForgetSpawn();
            }
        }
        if(this.Builder.Consul.CreepRequested) {
            if(!this.Spawner.Consul.ActiveSpawnNames[this.Builder.Consul.CreepRequested]) {
                this.Builder.Consul.ForgetSpawn();
            }
        }
        if(this.Spawner.Consul.CreepRequested) {
            if(!this.Spawner.Consul.ActiveSpawnNames[this.Spawner.Consul.CreepRequested]) {
                this.Spawner.Consul.ForgetSpawn();
            }
        }

        if (this.Collector.Consul.RequiresSpawn()) {
            let spawnArgs;
            if (this.Nest.energyCapacityAvailable >= 550) {
                spawnArgs = this.Collector.Consul.GetSpawnDefinition();
            } else {
                let newName = ('Harv' + Game.time);
                spawnArgs = {
                    body: [WORK, WORK, MOVE, CARRY],
                    creepName: newName,
                    requestorID: this.Collector.Consul.consulType,
                    targetTime: Game.time - 80
                }
            }
            this.Spawner.Consul.AddSpawnToQueue(spawnArgs);
            this.Collector.Consul.CreepRequested = spawnArgs.creepName;
        }
        if (this.Upgrader.Consul.RequiresSpawn()) {
            let spawnArgs = this.Upgrader.Consul.GetSpawnDefinition();
            spawnArgs.targetTime = Game.time;
            this.Spawner.Consul.AddSpawnToQueue(spawnArgs);
            this.Upgrader.Consul.CreepRequested = spawnArgs.creepName;
        }
        if (this.Builder.Consul.RequiresSpawn()) {
            let spawnArgs = this.Builder.Consul.GetSpawnDefinition();
            spawnArgs.targetTime = Game.time - 25;
            this.Spawner.Consul.AddSpawnToQueue(spawnArgs);
            this.Builder.Consul.CreepRequested = spawnArgs.creepName;
        }
        if (this.Spawner.Consul.RequiresSpawn()) {
            let spawnArgs = this.Spawner.Consul.GetSpawnDefinition();
            spawnArgs.targetTime = Game.time - 100;
            this.Spawner.Consul.AddSpawnToQueue(spawnArgs);
            this.Spawner.Consul.CreepRequested = spawnArgs.creepName;
        }

        if(this.Spawner.Consul.RefillerData.idleTime > 50) {
            if(!this.Builder.Consul.CreepRequested) {
                let spawnArgs = this.Builder.Consul.GetSpawnDefinition();
                spawnArgs.targetTime = Game.time - 25;
                this.Spawner.Consul.AddSpawnToQueue(spawnArgs);
                this.Builder.Consul.CreepRequested = spawnArgs.creepName;
            }
        }
    }
    InitializeNest(): void {
        // Don't think I need anything eh?
        if (this.Nest.find(FIND_MY_CREEPS).length == 0) {
            this.Spawner.Consul.AddSpawnToQueue({
                body: [WORK, MOVE, CARRY], creepName: this.Nest.name + '_FIRST',
                requestorID: this.Spawner.Consul.consulType, targetTime: Game.time - 500
            });
            this.Spawner.Consul.CreepRequested = this.Nest.name + '_FIRST';
        }
    }
    ReceiveCommand(): void {
        //Not implemented
    }
    ReleaseControl(creep: Creep): void {
        this.Upgrader.Consul.AssignCreep(creep);
    }

    MetamorphiseToFullGrownHiveQueen(): HiveQueenBase {
        throw new Error("Method not implemented.");
    }
}