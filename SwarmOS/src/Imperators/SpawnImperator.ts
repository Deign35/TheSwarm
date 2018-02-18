import * as SwarmCodes from 'Consts/SwarmCodes';
import { ImperatorBase } from "./ImperatorBase";
import { SpawnConsul } from 'Consuls/SpawnConsul';

export class SpawnImperator extends ImperatorBase {
    Consul!: SpawnConsul;
    InitImperator(memoryHandle: string) {
        this.Consul = new SpawnConsul(memoryHandle, this.Queen);
    }
    ActivateImperator(): SwarmCodes.SwarmErrors {
        let requirements = this.Consul.DetermineRequirements();
        if(this.Queen.Nest.energyAvailable > requirements.energyNeeded && requirements.neededBy <= (Game.time - 3)) { // 3 tick buffer??
            this.Consul.SpawnCreep();
        }
        return SwarmCodes.C_NONE;
    }
    ImperatorComplete() {
        this.Consul.Save();
    }
}