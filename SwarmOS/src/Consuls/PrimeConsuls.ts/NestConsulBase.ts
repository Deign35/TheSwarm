import { ChildMemory } from "Memory/SwarmMemory";

export abstract class NestConsulBase extends ChildMemory implements PrimeConsul {
    Save() {

        this.Save();
    }

    Load() {
        if (!this.Load()) { return false; }

        return true;
    }
}