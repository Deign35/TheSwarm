import { ChildMemory } from "Memory/SwarmMemory";

export abstract class NestConsulBase extends ChildMemory implements IPrimeConsul {
    Save() {

        this.Save();
    }

    Load() {
        if (!this.Load()) { return false; }

        return true;
    }
}