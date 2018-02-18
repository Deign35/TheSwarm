import * as SwarmCodes from "Consts/SwarmCodes";
import { HarvestImperator } from "Imperators/HarvestImperator";
import { HiveQueenBase } from "Queens/HiveQueenBase";

export class HiveQueen extends HiveQueenBase {
    protected CheckForSpawnRequirements(): void {
        if (this.Collector.Consul.DetermineRequirements()) {
            let newName = ('Harv' + Game.time);
            this.Spawner.AddSpawnToQueue({
                body: [WORK, WORK, MOVE, CARRY],
                creepName: newName,
                requestorID: this.Collector.Consul.consulType,
                targetTime: Game.time
            });
            this.Collector.Consul.CreepRequested = newName;
        }
    }
    InitializeNest(): void {
        // Don't think I need anything eh?
    }
    ReceiveCommand(): void {
        //Not implemented
    }

    Save() {
        super.Save();
    }
    Load() {
        if (!super.Load()) { return false; }

        return true;
    }
}