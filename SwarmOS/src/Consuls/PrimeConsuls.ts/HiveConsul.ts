import { ChildMemory } from "Memory/SwarmMemory";
import { NestConsulBase } from "./NestConsulBase";

export abstract class HiveConsul extends NestConsulBase implements PrimeConsul {
    Save() {

        this.Save();
    }

    Load() {
        if (!this.Load()) { return false; }

        return true;
    }
}