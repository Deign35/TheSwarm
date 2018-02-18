import * as SwarmCodes from 'Consts/SwarmCodes'
import { NestQueenBase } from "./NestQueenBase";
import { HarvestImperator } from "Imperators/HarvestImperator";
import { SpawnImperator } from 'Imperators/SpawnImperator';

const HARVEST_IMPERATOR_ID = 'HARVEST';
const SPAWNER_IMPERATOR_ID = 'SPAWNER';
export abstract class HiveQueenBase extends NestQueenBase implements IHiveQueen {
    Collector!: HarvestImperator;
    Spawner!: SpawnImperator;
    Save() {
        this.Collector.ImperatorComplete();
        this.Spawner.ImperatorComplete();
        super.Save();
    }
    ActivateNest() {
        this.ActivateImperators();
    }
    protected LoadImperators() {
        this.Collector = new HarvestImperator(HARVEST_IMPERATOR_ID, this);
        this.Spawner = new SpawnImperator(SPAWNER_IMPERATOR_ID, this);
    }
    protected ActivateImperators(): SwarmCodes.SwarmErrors {
        this.Collector.ActivateImperator();
        this.Spawner.ActivateImperator();

        return SwarmCodes.C_NONE;
    }
}