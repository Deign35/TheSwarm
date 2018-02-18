import * as SwarmCodes from "Consts/SwarmCodes";
import { HarvestImperator } from "Imperators/HarvestImperator";
import { HiveQueenBase } from "Queens/HiveQueenBase";

export class HiveQueen extends HiveQueenBase {
    protected CheckForSpawnRequirements(): void {
        throw new Error("Method not implemented.");
    }
    InitializeNest(): void {
        //throw new Error("Method not implemented.");
    }
    ReceiveCommand(): void {
        //throw new Error("Method not implemented.");
    }
}