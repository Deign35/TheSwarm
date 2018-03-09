export const MY_USERNAME = 'Deign';
export const MY_SIGNATURE = 'The Swarm shall rise -- SwarmOS v0.7.2';
export const CREEP_COUNTER = 'CreepCounter';

export enum SpawnPriority {
    Lowest = 0,
    Low = 2,
    Mid = 4,
    High = 6,
    Highest = 8,
    EMERGENCY = 10,
}

export enum SpawnRequest_TerminationType {
    OneOff = 0,
    Infinite = 1,
    RCL_Upgrade = 2,
    EnergyCapacity = 3,
    NumCount = 4,
}