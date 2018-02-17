import { NestConsulBase } from "./NestConsulBase";

export abstract class HiveConsulBase extends NestConsulBase {
    Save() {

        this.Save();
    }

    Load() {
        if (!this.Load()) { return false; }

        return true;
    }
}