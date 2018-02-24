import * as SwarmCodes from "Consts/SwarmCodes";
import { HiveQueenBase } from "Queens/HiveQueenBase";

export class HiveQueen extends HiveQueenBase {
    protected CheckForSpawnRequirements(): void {
        for (let i = 0, length = this.CreepConsulList.length; i < length; i++) {
            if (this.CreepConsulList[i].CreepRequested) {
                if (!this.Spawner.ActiveSpawnNames[this.CreepConsulList[i].CreepRequested as string]) {
                    this.CreepConsulList[i].ForgetSpawn();
                }
            }
        }

        if (this.Collector.GetNextSpawn()) {
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
        if (this.Upgrader.GetNextSpawn()) {
            let spawnArgs = this.Upgrader.GetSpawnDefinition();
            spawnArgs.targetTime = Game.time;
            this.Spawner.AddSpawnToQueue(spawnArgs);
            this.Upgrader.CreepRequested = spawnArgs.creepName;
        }
        if (this.Builder.GetNextSpawn()) {
            let spawnArgs = this.Builder.GetSpawnDefinition();
            spawnArgs.targetTime = Game.time - 25;
            this.Spawner.AddSpawnToQueue(spawnArgs);
            this.Builder.CreepRequested = spawnArgs.creepName;
        }
        if (this.Distributor.GetNextSpawn()) {
            let spawnArgs = this.Distributor.GetSpawnDefinition();
            spawnArgs.targetTime = Game.time - 100;
            this.Spawner.AddSpawnToQueue(spawnArgs);
            this.Distributor.CreepRequested = spawnArgs.creepName;
        }

        if (this.Distributor.GetIdleTime() > 100) {
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