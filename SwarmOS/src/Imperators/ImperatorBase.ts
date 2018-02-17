import * as SwarmCodes from "Consts/SwarmCodes"
import { NestQueenBase } from "Queens/NestQueenBase";

export abstract class ImperatorBase implements IImperator {
    constructor(memID: string, protected Queen: NestQueenBase) { this.InitImperator(memID); }
    abstract InitImperator(memoryHandle: string): void;
    abstract ImperatorComplete(): void;
    abstract ActivateImperator(): SwarmCodes.SwarmErrors;
}