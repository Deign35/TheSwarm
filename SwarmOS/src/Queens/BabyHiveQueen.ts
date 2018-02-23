import * as SwarmCodes from "Consts/SwarmCodes";
import { HiveQueenBase } from "Queens/HiveQueenBase";
import { HarvestImperator } from "Imperators/HarvestImperator";
import { SpawnConsul } from "Consuls/SpawnConsul";
import { HarvestConsul } from "Consuls/HarvestConsul";
import * as _ from 'lodash';
import { ControllerConsul } from "Consuls/ControllerConsul";

export class BabyHiveQueen extends HiveQueenBase {
    protected CheckForSpawnRequirements(): void {
        if (this.Collector.Consul.CreepRequested) {
            if (!this.Spawner.ActiveSpawnNames[this.Collector.Consul.CreepRequested]) {
                this.Collector.Consul.ForgetSpawn();
            }
        }
        if (this.Upgrader.Consul.CreepRequested) {
            if (!this.Spawner.ActiveSpawnNames[this.Upgrader.Consul.CreepRequested]) {
                this.Upgrader.Consul.ForgetSpawn();
            }
        }
        if (this.Builder.Consul.CreepRequested) {
            if (!this.Spawner.ActiveSpawnNames[this.Builder.Consul.CreepRequested]) {
                this.Builder.Consul.ForgetSpawn();
            }
        }
        if (this.Distributor.Consul.CreepRequested) {
            if (!this.Spawner.ActiveSpawnNames[this.Distributor.Consul.CreepRequested]) {
                this.Distributor.Consul.ForgetSpawn();
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
            this.Spawner.AddSpawnToQueue(spawnArgs);
            this.Collector.Consul.CreepRequested = spawnArgs.creepName;
        }
        if (this.Upgrader.Consul.RequiresSpawn()) {
            let spawnArgs = this.Upgrader.Consul.GetSpawnDefinition();
            spawnArgs.targetTime = Game.time;
            this.Spawner.AddSpawnToQueue(spawnArgs);
            this.Upgrader.Consul.CreepRequested = spawnArgs.creepName;
        }
        if (this.Builder.Consul.RequiresSpawn()) {
            let spawnArgs = this.Builder.Consul.GetSpawnDefinition();
            spawnArgs.targetTime = Game.time - 25;
            this.Spawner.AddSpawnToQueue(spawnArgs);
            this.Builder.Consul.CreepRequested = spawnArgs.creepName;
        }
        if (this.Distributor.Consul.RequiresSpawn()) {
            let spawnArgs = this.Distributor.Consul.GetSpawnDefinition();
            spawnArgs.targetTime = Game.time - 100;
            this.Spawner.AddSpawnToQueue(spawnArgs);
            this.Distributor.Consul.CreepRequested = spawnArgs.creepName;
        }

        if (this.Distributor.Consul.SpawnRefillerData.idleTime > 100) {
            if (!this.Upgrader.Consul.CreepRequested) {
                let spawnArgs = this.Upgrader.Consul.GetSpawnDefinition();
                spawnArgs.targetTime = Game.time;
                this.Spawner.AddSpawnToQueue(spawnArgs);
                this.Upgrader.Consul.CreepRequested = spawnArgs.creepName;
            }
        }
    }
    InitializeNest(): void {
        // Don't think I need anything eh?
        if (this.Nest.find(FIND_MY_CREEPS).length == 0) {
            this.Spawner.AddSpawnToQueue({
                body: [WORK, MOVE, CARRY], creepName: this.Nest.name + '_FIRST',
                requestorID: this.Distributor.Consul.consulType, targetTime: Game.time - 500
            });
            this.Distributor.Consul.CreepRequested = this.Nest.name + '_FIRST';
        }
    }
    ReceiveCommand(): void {
        //Not implemented
    }
    ReleaseControl(creep: Creep): void {
        this.Upgrader.Consul.AssignCreep(creep);
    }
}