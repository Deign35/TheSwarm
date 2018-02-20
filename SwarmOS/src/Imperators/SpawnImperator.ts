import * as SwarmCodes from "Consts/SwarmCodes"
import { ImperatorBase } from "Imperators/ImperatorBase";
import { MoveToPositionAction } from "Actions/MoveToPositionAction";
import { SpawnConsul } from "Consuls/SpawnConsul";

export class SpawnImperator extends ImperatorBase {
    Consul!: SpawnConsul;
    InitImperator(memoryHandle: string): void {
        this.Consul = new SpawnConsul(memoryHandle, this.Queen);
    }
    ImperatorComplete(): void {
        this.Consul.Save();
    }
    ActivateImperator(): SwarmCodes.SwarmErrors {
        let refiller = this.Consul.SpawnRefiller;
        // transfer energy from container or harvester
        // deliver to an extension or spawner.
        if (!refiller) {
            return SwarmCodes.C_NONE;
        }

        if (refiller.carry[RESOURCE_ENERGY] > 0) {
            
        } else {
            // Give to the harvester.
        }

        return SwarmCodes.C_NONE;
    }
}