import { QueenMemory } from "Memory/SwarmMemory";
import * as SwarmEnums from "SwarmEnums";
import { HiveHarvestOverseer } from "Overseers/HiveHarvestOverseer";
import { HiveQueenBase } from "Queens/HiveQueenBase";
import { HiveConsul } from "Consuls/PrimeConsuls/HiveConsul";

const DISTRIBUTION = 'Di';
const HIVE_HARVESTER = 'HH';
const ARCHITECTURE = 'Ar';
const HIVELORD = 'HL';
const CONSTRUCTION = 'Ct';
const CREEP_DATA = 'CD';
const NO_ASSIGNMENT = 'NA';
const HIVE_BOOTSTRAPPING = 'HB';
const BOOTSTRAPPER = 'BS';
export class BabyHiveQueen extends HiveQueenBase {
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
    LoadPrimeConsul(): void {
        throw new Error("Method not implemented.");
    }
    InitializeNest(): void {
        throw new Error("Method not implemented.");
    }
    ActivateNest(): void {
        throw new Error("Method not implemented.");
    }
    ReceiveOrder(): void {
        throw new Error("Method not implemented.");
    }
    Harvester!: HiveHarvestOverseer;

    Save() {
        this.SetData(HIVE_HARVESTER, this.Harvester);
        super.Save();
    }
    Load() {
        if (!super.Load()) { return false; }
        this.Harvester = new HiveHarvestOverseer(HIVELORD, this);

        return true;
    }

    MetamorphiseToFullGrownHiveQueen(): HiveQueenBase {
        throw new Error("Method not implemented.");
    }
}