import { CreepSuit } from "./CreepSuit";

export class HarvestSuit extends CreepSuit<CreepSuitType.SourceHarvester> {
    get CreepSuitType(): CreepSuitType.SourceHarvester { return CreepSuitType.SourceHarvester; }
    PrepSuit(): boolean {
        throw new Error("Method not implemented.");
    }
    ActivateSuit(): void {
        throw new Error("Method not implemented.");
    }
    FinalizeSuitData(): void {
        throw new Error("Method not implemented.");
    }
}