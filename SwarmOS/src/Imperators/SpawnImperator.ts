import * as SwarmCodes from 'Consts/SwarmCodes';
import { ImperatorBase } from "./ImperatorBase";

export class SpawnImperator extends ImperatorBase {

    InitImperator(memoryHandle: string) {

    }
    ImperatorComplete() {

    }
    ActivateImperator(): SwarmCodes.SwarmErrors {
        return SwarmCodes.C_NONE;
    }
}