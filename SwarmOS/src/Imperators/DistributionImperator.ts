import * as SwarmCodes from "Consts/SwarmCodes"
import { ImperatorBase } from "Imperators/ImperatorBase";
import { DistributionConsul } from "Consuls/DistributionConsul";

export class DistributionImperator extends ImperatorBase {
    Consul!: DistributionConsul;
    InitImperator(memoryHandle: string): void {
        this.Consul = new DistributionConsul(memoryHandle, this.Queen);
    }
    ImperatorComplete(): void {
        this.Consul.Save();
    }
    ActivateImperator(): SwarmCodes.SwarmErrors {
        return SwarmCodes.E_NOT_IMPLEMENTED;
    }
}