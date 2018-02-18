import * as SwarmCodes from "consts/SwarmCodes"
import { ChildMemory } from "Tools/SwarmMemory";
import { NestQueenBase } from "Queens/NestQueenBase";

/* Consuls will be responsible for surveying for the information needed for its assigned overseer.
This could include detecting when to spawn a new creep, scheduling deliveries and repair orders, etc...
The overseer is the executor of the conclusions of the consul.
Could change the name of overseer to Imperator


IDEA for the Overseer name to be moved to specific instances of a Consul/Imperator decision process.
i.e. A consul will detect a source in the next room and that I can make positive energy gains by harvesting it.
the consul notifies the Imperator, who then creates an Overseer to handle that specific source node.
This Overseer can be one that is bootstrapping a room, a PrimeHarvester, a distant room miner, and even a new room assistant

room assistant will need to be handled at the Imperaturs/Consul -- HiveQueen level since it needs to be communicated through the SwarmQueen.
Or does the SwarmQueen direct the HiveQueen to deliver to the new HiveQueen?
*/
export abstract class ConsulBase extends ChildMemory implements IConsul {
    Nest!: Room;
    constructor(id: string, public Parent: NestQueenBase) {
        super(id, Parent);
    }
    Load() {
        if (!super.Load()) { return false; }
        this.Nest = Game.rooms[this.Parent.id];

        return true;
    }
    abstract get consulType(): string;
    abstract ScanRoom(): void;
    abstract DetermineRequirements(): void;
    static get ConsulType(): string { return 'SwarmCodes.E_NOT_IMPLEMENTED'; }
}