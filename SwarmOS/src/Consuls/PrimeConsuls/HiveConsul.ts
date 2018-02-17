import { HiveConsulBase } from "Consuls/PrimeConsuls/HiveConsulBase";

export abstract class HiveConsul extends HiveConsulBase {
    Save() {

        this.Save();
    }

    Load() {
        if (!this.Load()) { return false; }

        return true;
    }
}