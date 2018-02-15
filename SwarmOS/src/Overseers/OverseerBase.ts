import { ChildMemory, _SwarmMemory } from "Memory/SwarmMemory";
import { ConsulBase } from "Consuls/ConsulBase"

const CONSUL_TYPE = 'ConsulType';
export abstract class OverseerBase extends ChildMemory implements IOverseer {
    Hive!: Room;

    constructor(memID: string, protected Queen: _SwarmMemory) {
        super(memID, Queen);
    }

    Save() {
        super.Save();
    }
    Load() {
        if (!super.Load()) { return false; }
        this.Hive = Game.rooms[this.Queen.id];

        return true;
    }

    abstract ActivateOverseer(): void;
    abstract InitNewOverseer(): void;
    abstract ValidateOverseer(): void;
}