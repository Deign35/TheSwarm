declare interface IQueen {
    QueenType: QueenType
    ReceiveCommand(): void;

    StartTick(): void;
    ProcessTick(): void;
    EndTick(): void;
}