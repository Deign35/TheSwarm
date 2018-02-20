import * as SwarmCodes from "Consts/SwarmCodes"
import { QueenMemory } from "Tools/SwarmMemory";

export abstract class NestQueenBase extends QueenMemory implements INestQueen {
    Nest!: Room;
    Commands!: any; // Needs to be defined
    Load() {
        if (!super.Load()) { return false; }
        this.Nest = Game.rooms[this.id];
        this.LoadImperators();
        return true;
    }

    protected InitMemory() {
        super.InitMemory();
        this.Nest = Game.rooms[this.id];
        this.LoadImperators();
        this.InitializeNest();
    }
    abstract InitializeNest(): void;
    abstract ActivateNest(): void;

    abstract ReceiveCommand(): void;
    abstract ReleaseControl(creep: Creep): void;
    protected abstract LoadImperators(): void;
    protected abstract ActivateImperators(): SwarmCodes.SwarmErrors;
}