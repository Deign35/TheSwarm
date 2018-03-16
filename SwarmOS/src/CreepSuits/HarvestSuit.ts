import { CreepSuit } from "./CreepSuit";

export class HarvestSuit extends CreepSuit<CreepSuitTypes.SourceHarvester> {
    get CreepSuitType(): CreepSuitTypes.SourceHarvester { return CreepSuitTypes.SourceHarvester; }
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