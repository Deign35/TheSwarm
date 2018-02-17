import { QueenMemory } from "Memory/SwarmMemory";

const IMPERATOR_IDS = 'IMP_IDS';
export abstract class NestQueenBase extends QueenMemory implements INestQueen {
    abstract InitMemory(): void;
    abstract InitializeNest(): void;
    abstract ActivateNest(): void;

    Commands!: any; // Needs to be defined
    abstract ReceiveCommand(): void;
    Imperators!: IOverseer[];
    abstract LoadImperators(): void;
    PrimeConsul!: IPrimeConsul;
    abstract LoadPrimeConsul(): void;
    // Pathfinder
    // Overwatch (SwarmLinkOverseer)
    // This is where a HiveQueen will tell the NestQueens what to do
    // Or the SwarmQueen will tell the HiveQueens what to do.
}

/*

declare class NestQueenBase implements INestQueen {
    Imperators: IOverseer[];
    id: string;
    Save(): void;
    Load(): void;
    GetData(id: string): any;
    SetData(id: string, data: any): void ;
    RemoveData(id: string): void;
}

declare class NestQueen extends NestQueenBase {

}

declare class HiveQueenBase extends NestQueenBase {

}

declare class HiveQueen extends HiveQueenBase {

}
declare class BabyHiveQueen extends HiveQueenBase {

}*/