import * as SwarmCodes from "Consts/SwarmCodes";
import { HiveQueenBase } from "Queens/HiveQueenBase";
import { HarvestImperator } from "Imperators/HarvestImperator";
import { SpawnConsul } from "Consuls/SpawnConsul";
import { HarvestConsul } from "Consuls/HarvestConsul";
import * as _ from 'lodash';
import { ControllerConsul } from "Consuls/ControllerConsul";

export class BabyHiveQueen extends HiveQueenBase {
    protected CheckForSpawnRequirements(): void {
        if (this.Collector.Consul.RequiresSpawn()) {
            let newName = ('Harv' + Game.time);
            this.Spawner.Consul.AddSpawnToQueue({
                body: [WORK, WORK, MOVE, CARRY],
                creepName: newName,
                requestorID: this.Collector.Consul.consulType,
                targetTime: 0
            });
            this.Collector.Consul.CreepRequested = newName;
        }
        if (this.Upgrader.Consul.RequiresSpawn()) {
            let spawnArgs = this.Upgrader.Consul.GetSpawnDefinition();
            this.Spawner.Consul.AddSpawnToQueue(spawnArgs);
            this.Upgrader.Consul.CreepRequested = spawnArgs.creepName;
        }
        if (this.Builder.Consul.RequiresSpawn()) {
            let spawnArgs = this.Builder.Consul.GetSpawnDefinition();
            this.Spawner.Consul.AddSpawnToQueue(spawnArgs);
            this.Builder.Consul.CreepRequested = spawnArgs.creepName;
        }

        if(this.Spawner.Consul.RequiresSpawn()) {
            let spawnArgs = this.Spawner.Consul.GetSpawnDefinition();
            this.Spawner.Consul.AddSpawnToQueue(spawnArgs);
            this.Spawner.Consul.CreepRequested = spawnArgs.creepName;
        }
    }
    InitializeNest(): void {
        // Don't think I need anything eh?
    }
    ReceiveCommand(): void {
        //Not implemented
    }
    ReleaseControl(creepName: string): void {

    }

    MetamorphiseToFullGrownHiveQueen(): HiveQueenBase {
        throw new Error("Method not implemented.");
    }
}