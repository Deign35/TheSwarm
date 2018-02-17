import { NestQueenBase } from "./NestQueenBase";

export abstract class HiveQueenBase extends NestQueenBase implements IHiveQueen {
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