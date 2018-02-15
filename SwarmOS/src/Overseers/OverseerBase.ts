import { ChildMemory, _SwarmMemory } from "Memory/SwarmMemory";
import { ConsulBase } from "Consuls/ConsulBase"

const CONSUL_TYPE = 'ConsulType';
export abstract class OverseerBase<T extends IConsul> extends ChildMemory implements IOverseer {
    Hive!: Room;
    Consul!: T;

    constructor(memID: string, protected Queen: _SwarmMemory) {
        super(memID, Queen);
    }

    Save() {
        this.Consul.Save();
        super.Save();
    }
    Load() {
        if(!super.Load()) { return false; }
        this.Hive = Game.rooms[this.Queen.id];
        this.LoadConsul();

        return true;
    }

    abstract ActivateOverseer(): void;
    abstract InitNewOverseer(): void;
    abstract LoadConsul(): void;
    abstract ValidateOverseer(): void;
}