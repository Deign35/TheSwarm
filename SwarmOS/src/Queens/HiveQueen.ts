import * as SwarmCodes from "Consts/SwarmCodes";
import { HiveQueenBase } from "Queens/HiveQueenBase";

export class HiveQueen extends HiveQueenBase {
    protected CheckForSpawnRequirements(): void {
        for (let i = 0, length = this.CreepConsulList.length; i < length; i++) {
            //this.CreepConsulList[i].GetDefaultJobCo
        }
    }
    ReceiveCommand(): void {
        //Not implemented
    }
    ReleaseControl(creep: string): void {
    }
}