import * as SwarmCodes from "Consts/SwarmCodes";
import { HiveQueenBase } from "Queens/HiveQueenBase";
import { HarvestImperator } from "Imperators/HarvestImperator";
import { SpawnConsul } from "Consuls/SpawnConsul";
import { HarvestConsul } from "Consuls/HarvestConsul";

export class BabyHiveQueen extends HiveQueenBase {
    protected CheckForSpawnRequirements(): void {
        if (this.Collector.Consul.RequiresSpawn()) {
            let newName = ('Harv' + Game.time);
            this.Spawner.AddSpawnToQueue({
                body: [WORK, WORK, MOVE, CARRY],
                creepName: newName,
                requestorID: this.Collector.Consul.consulType,
                targetTime: Game.time
            });
            this.Collector.Consul.CreepRequested = newName;
        }
        if(this.Upgrader.Consul.RequiresSpawn()) {
            let spawnArgs = this.Upgrader.Consul.GetSpawnDefinition();
            this.Spawner.AddSpawnToQueue(spawnArgs);
            this.Upgrader.Consul.CreepRequested = spawnArgs.creepName;
        }
    }
    InitializeNest(): void {
        // Don't think I need anything eh?
    }
    ReceiveCommand(): void {
        //Not implemented
    }

    MetamorphiseToFullGrownHiveQueen(): HiveQueenBase {
        throw new Error("Method not implemented.");
    }
}