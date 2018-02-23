import * as SwarmCodes from "Consts/SwarmCodes";
import { HiveQueenBase } from "Queens/HiveQueenBase";

export class HiveQueen extends HiveQueenBase {
    protected CheckForSpawnRequirements(): void {
        if (this.Collector.CreepRequested) {
            if (!this.Spawner.ActiveSpawnNames[this.Collector.CreepRequested]) {
                this.Collector.ForgetSpawn();
            }
        }
        if (this.Upgrader.CreepRequested) {
            if (!this.Spawner.ActiveSpawnNames[this.Upgrader.CreepRequested]) {
                this.Upgrader.ForgetSpawn();
            }
        }
        if (this.Builder.CreepRequested) {
            if (!this.Spawner.ActiveSpawnNames[this.Builder.CreepRequested]) {
                this.Builder.ForgetSpawn();
            }
        }
        if (this.Distributor.CreepRequested) {
            if (!this.Spawner.ActiveSpawnNames[this.Distributor.CreepRequested]) {
                this.Distributor.ForgetSpawn();
            }
        }

        if (this.Collector.RequiresSpawn()) {
            let spawnArgs;
            if (this.Nest.energyCapacityAvailable >= 550) {
                spawnArgs = this.Collector.GetSpawnDefinition();
            } else {
                let newName = ('Harv' + Game.time);
                spawnArgs = {
                    body: [WORK, WORK, MOVE, CARRY],
                    creepName: newName,
                    requestorID: this.Collector.consulType,
                    targetTime: Game.time - 80
                }
            }
            this.Spawner.AddSpawnToQueue(spawnArgs);
            this.Collector.CreepRequested = spawnArgs.creepName;
        }
        if (this.Upgrader.RequiresSpawn()) {
            let spawnArgs = this.Upgrader.GetSpawnDefinition();
            spawnArgs.targetTime = Game.time;
            this.Spawner.AddSpawnToQueue(spawnArgs);
            this.Upgrader.CreepRequested = spawnArgs.creepName;
        }
        if (this.Builder.RequiresSpawn()) {
            let spawnArgs = this.Builder.GetSpawnDefinition();
            spawnArgs.targetTime = Game.time - 25;
            this.Spawner.AddSpawnToQueue(spawnArgs);
            this.Builder.CreepRequested = spawnArgs.creepName;
        }
        if (this.Distributor.RequiresSpawn()) {
            let spawnArgs = this.Distributor.GetSpawnDefinition();
            spawnArgs.targetTime = Game.time - 100;
            this.Spawner.AddSpawnToQueue(spawnArgs);
            this.Distributor.CreepRequested = spawnArgs.creepName;
        }

        if (this.Distributor.GetDistributionIdleTime() > 100) {
            if (!this.Upgrader.CreepRequested) {
                let spawnArgs = this.Upgrader.GetSpawnDefinition();
                spawnArgs.targetTime = Game.time;
                this.Spawner.AddSpawnToQueue(spawnArgs);
                this.Upgrader.CreepRequested = spawnArgs.creepName;
            }
        }
    }
    InitializeNest(): void {
        // Don't think I need anything eh?
        if (this.Nest.find(FIND_MY_CREEPS).length == 0) {
            this.Spawner.AddSpawnToQueue({
                body: [WORK, MOVE, CARRY], creepName: this.Nest.name + '_FIRST',
                requestorID: this.Distributor.consulType, targetTime: Game.time - 500
            });
            this.Distributor.CreepRequested = this.Nest.name + '_FIRST';
        }
    }
    ReceiveCommand(): void {
        //Not implemented
    }
    ReleaseControl(creep: Creep): void {
        this.Upgrader.AssignCreep(creep);
    }
}