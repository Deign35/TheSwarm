import { QueenMemory } from "Memory/SwarmMemory";

export abstract class NestQueenBase<T extends PrimeConsul> extends QueenMemory {
    PrimeConsul!: T;
    // Pathfinder
    // Overwatch (SwarmLinkOverseer)
    Save() {
        super.Save();
    }
    Load() {
        if (!super.Load()) { return false; }

        return true;
    }

    InitializeNest() {

    }
    ActivateNest() {

    }
    abstract LoadConsul(): void;
    abstract ReceiveOrder(): void;
    // This is where a HiveQueen will tell the NestQueens what to do
    // Or the SwarmQueen will tell the HiveQueens what to do.
}