import * as SwarmCodes from "Consts/SwarmCodes"
import { ImperatorBase } from "Imperators/ImperatorBase";
import { DistributionConsul } from "Consuls/DistributionConsul";

export class DistributionImperator extends ImperatorBase {
    Consul!: DistributionConsul;
    InitImperator(memoryHandle: string): void {

    }
    ImperatorComplete(): void {

    }
    ActivateImperator(): SwarmCodes.SwarmErrors {
        return SwarmCodes.E_NOT_IMPLEMENTED;
    }
}