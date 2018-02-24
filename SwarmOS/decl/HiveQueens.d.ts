declare interface INestQueen extends IMemory {
}

declare interface IHiveQueen extends INestQueen {

}

declare enum CreepRequest_TerminationType {
    OneOff = 0,
    Infinite = 1,
    RCL_Upgrade = 2,
    EnergyCapacity = 3,
    NumCount = 4,
}

declare type CreepRequestData = {
    requestID: string,
    requestor: string,
    body: BodyPartConstant[],
    creepSuffix: string,
    terminationType: CreepRequest_TerminationType,
    count?: number,
    energyCapacity?: number, // Meaning when the room's capacity exceeds this value, stop building these.
}