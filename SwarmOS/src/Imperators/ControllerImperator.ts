import * as SwarmCodes from "Consts/SwarmCodes"
import { ImperatorBase } from "Imperators/ImperatorBase";
import { ControllerConsul } from "Consuls/ControllerConsul";

export class ControllerImperator extends ImperatorBase {
    Consul!: ControllerConsul;
    InitImperator(memoryHandle: string): void {
        this.Consul = new ControllerConsul(memoryHandle, this.Queen);
    }
    ImperatorComplete(): void {
        this.Consul.Save();
    }
    ActivateImperator(): SwarmCodes.SwarmErrors {
        return SwarmCodes.E_NOT_IMPLEMENTED;
    }
}