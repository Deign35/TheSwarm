import * as SwarmCodes from "Consts/SwarmCodes";
import { HarvestImperator } from "Imperators/HarvestImperator";
import { HiveQueenBase } from "Queens/HiveQueenBase";
import { ImperatorBase } from "Imperators/ImperatorBase";

const DISTRIBUTION = 'Di';
const HIVE_HARVESTER = 'HH';
const ARCHITECTURE = 'Ar';
const HIVELORD = 'HL';
const CONSTRUCTION = 'Ct';
const CREEP_DATA = 'CD';
const NO_ASSIGNMENT = 'NA';
export class BabyHiveQueen extends HiveQueenBase {
    protected ActivateImperators(): SwarmCodes.SwarmErrors {
        throw new Error("Method not implemented.");
    }
    InitMemory(): void {
        throw new Error("Method not implemented.");
    }
    ReceiveCommand(): void {
        throw new Error("Method not implemented.");
    }
    // Entirely here to do bootstrapping of newly controlled rooms.
    // Goal is to get up to lvl 2, 5 extensions and 2 containers
    // as quickly as possible.
    LoadImperators(): void {
        throw new Error("Method not implemented.");
    }
    InitializeNest(): void {
        throw new Error("Method not implemented.");

    }
    ActivateImperator(imperator: ImperatorBase): SwarmCodes.SwarmErrors {
        return imperator.ActivateImperator();
    }
    ActivateNest(): void {
        let errorCode = this.ActivateImperator(this.Harvester);
        // do the rest of them.
    }
    ReceiveOrder(): void {
        throw new Error("Method not implemented.");
    }
    Harvester!: HarvestImperator;

    Save() {
        this.SetData(HIVE_HARVESTER, this.Harvester);
        super.Save();
    }
    Load() {
        if (!super.Load()) { return false; }
        this.Harvester = new HarvestImperator(HIVE_HARVESTER, this);

        return true;
    }

    MetamorphiseToFullGrownHiveQueen(): HiveQueenBase {
        throw new Error("Method not implemented.");
    }
}