declare type C_Attack = 'At'; export const C_Attack = 'At';
declare type C_Build = 'Bu'; export const C_Build = 'Bu';
declare type C_Dismantle = 'Di'; export const C_Dismantle = 'Di';
declare type C_Drop = 'Dr'; export const C_Drop = 'Dr';
declare type C_Harvest = 'Ha'; export const C_Harvest = 'Ha';
declare type C_Heal = 'He'; export const C_Heal = 'He';
declare type C_Pickup = 'Pi'; export const C_Pickup = 'Pi';
declare type C_RangedAttack = 'RA'; export const C_RangedAttack = 'RA';
declare type C_RangedHeal = 'RH'; export const C_RangedHeal = 'RH';
declare type C_Repair = 'Re'; export const C_Repair = 'Re';
declare type C_Say = 'Sa'; export const C_Say = 'Sa';
declare type C_Suicide = 'Su'; export const C_Suicide = 'Su';
declare type C_Transfer = 'Tr'; export const C_Transfer = 'Tr';
declare type C_Upgrade = 'Up'; export const C_Upgrade = 'Up';
declare type C_Withdraw = 'Wi'; export const C_Withdraw = 'Wi';

export enum AdvancedCreepCommandType {
    A_FindTarget = 'FT',
}

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

export type CreepCommandType = BasicCreepCommandType | AdvancedCreepCommandType;

export const CommandAny = 'AnyC'; declare type CommandAny = 'AnyC';
export const CommandEnd = 'CmdC'; declare type CommandEnd = 'CmdC';
export type CommandType = CommandAny | CommandEnd | CreepCommandType;

export const HL_REQUIRE_CREEP = -16; declare type HL_REQUIRE_CREEP = -16;
export const HL_RETRY = -17; declare type HL_RETRY = -17;
export const HL_REQUIRE_ARGS = -18; declare type HL_REQUIRE_ARGS = -18;
export const HL_NEXT_COMMAND = -19; declare type HL_NEXT_COMMAND = -19;
export type SwarmReturnCode = ScreepsReturnCode | HL_REQUIRE_CREEP | HL_RETRY | HL_REQUIRE_ARGS | HL_NEXT_COMMAND;

export enum RoleNames {
    RCL1_Harvest,
    RCL1_Upgrader,
    RCL2_Builder,
    RCL3_Harvester,
}