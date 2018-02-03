export enum BasicCreepCommandType {
    C_Attack = 'At',
    C_Build = 'Bu',
    C_Dismantle = 'Di',
    C_Drop = 'Dr',
    C_Harvest = 'Ha',
    C_Heal = 'He',
    C_Pickup = 'Pi',
    C_RangedAttack = 'RA',
    C_RangedHeal = 'RH',
    C_Repair = 'Re',
    C_Say = 'Sa',
    C_Suicide = 'Su',
    C_Transfer = 'Tr',
    C_Upgrade = 'Up',
    C_Withdraw = 'Wi'
}

export enum AdvancedCreepCommandType {
    A_FindTarget = 'FT',
}

declare type CreepCommandType = BasicCreepCommandType | AdvancedCreepCommandType;

export const CommandAny = 'AnyC'; declare type CommandAny = 'AnyC';
export const CommandEnd = 'CmdC'; declare type CommandEnd = 'CmdC';

declare type CommandType = CommandAny | CommandEnd | CreepCommandType;

export const J_REQUIRE_CREEP = -16; declare type J_REQUIRE_CREEP = -16;
export enum JobResults {
    RequiresCreep = 'RC',
    Retry = 'Re'
    //
}

declare type SwarmReturnCode = ScreepsReturnCode | J_REQUIRE_CREEP;