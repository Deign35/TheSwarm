import * as SwarmCodes from 'Consts/SwarmCodes'
import { NestQueenBase } from "./NestQueenBase";
import { HarvestImperator } from "Imperators/HarvestImperator";

const HARVEST_IMPERATOR_ID = 'HARV';
export abstract class HiveQueenBase extends NestQueenBase implements IHiveQueen {
    protected Collector!: HarvestImperator;
    Save() {
        this.Collector.ImperatorComplete();
        super.Save();
    }
    Load() {
        if (!super.Load()) { return false; }

        this.Collector = new HarvestImperator(HARVEST_IMPERATOR_ID, this);
        return true;
    }
    ActivateNest() {
        this.ActivateImperators();
    }
    protected ActivateImperators(): SwarmCodes.SwarmErrors {
        return SwarmCodes.E_NOT_IMPLEMENTED;
    }
}