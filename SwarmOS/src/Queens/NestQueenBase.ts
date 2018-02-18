import * as SwarmCodes from "Consts/SwarmCodes"
import { QueenMemory } from "Tools/SwarmMemory";

export abstract class NestQueenBase extends QueenMemory implements INestQueen {
    Nest!: Room;
    Load() {
        if (!super.Load()) { return false; }
        this.Nest = Game.rooms[this.id];
        this.LoadImperators();
        return true;
    }

    protected InitMemory() {
        super.InitMemory();
        this.LoadImperators();
    }
    abstract InitializeNest(): void;
    abstract ActivateNest(): void;

    Commands!: any; // Needs to be defined
    abstract ReceiveCommand(): void;
    protected abstract LoadImperators(): void;
    protected abstract ActivateImperators(): SwarmCodes.SwarmErrors;
    // Pathfinder
    // Overwatch (SwarmLinkOverseer)
    // This is where a HiveQueen will tell the NestQueens what to do
    // Or the SwarmQueen will tell the HiveQueens what to do.
}