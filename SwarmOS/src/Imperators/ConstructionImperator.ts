import * as SwarmCodes from "Consts/SwarmCodes"
import { ImperatorBase } from "Imperators/ImperatorBase";
import { ConstructionConsul } from "Consuls/ConstructionConsul";

export class ConstructionImperator extends ImperatorBase {
    Consul!: ConstructionConsul;
    InitImperator(memoryHandle: string): void {

    }
    ImperatorComplete(): void {

    }
    ActivateImperator(): SwarmCodes.SwarmErrors {
        return SwarmCodes.E_NOT_IMPLEMENTED;
    }
}