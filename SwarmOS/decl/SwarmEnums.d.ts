declare type C_Attack = 'At'; declare const C_Attack = 'At';
declare type C_Build = 'Bu'; declare const C_Build = 'Bu';
declare type C_Dismantle = 'Di'; declare const C_Dismantle = 'Di';
declare type C_Drop = 'Dr'; declare const C_Drop = 'Dr';
declare type C_Harvest = 'Ha'; declare const C_Harvest = 'Ha';
declare type C_Heal = 'He'; declare const C_Heal = 'He';
declare type C_Pickup = 'Pi'; declare const C_Pickup = 'Pi';
declare type C_RangedAttack = 'RA'; declare const C_RangedAttack = 'RA';
declare type C_RangedHeal = 'RH'; declare const C_RangedHeal = 'RH';
declare type C_Repair = 'Re'; declare const C_Repair = 'Re';
declare type C_Say = 'Sa'; declare const C_Say = 'Sa';
declare type C_Suicide = 'Su'; declare const C_Suicide = 'Su';
declare type C_Transfer = 'Tr'; declare const C_Transfer = 'Tr';
declare type C_Upgrade = 'Up'; declare const C_Upgrade = 'Up';
declare type C_Withdraw = 'Wi'; declare const C_Withdraw = 'Wi';

declare type BasicCreepCommandType =
    C_Attack | C_Build | C_Dismantle | C_Drop |
    C_Harvest | C_Heal | C_Pickup | C_RangedAttack |
    C_RangedHeal | C_Repair | C_Say | C_Suicide |
    C_Transfer | C_Upgrade | C_Withdraw;

declare type A_FindTarget = 'FT'; declare const A_FindTarget = 'FT';

declare type AdvancedCreepCommandType = A_FindTarget;

declare type CreepCommandType = BasicCreepCommandType | AdvancedCreepCommandType;

declare type CommandAny = 'AnyC'; declare const CommandAny = 'AnyC';
declare type CommandDone = 'CmdC'; declare const CommandDone = 'CmdC';
declare type CommandType = CreepCommandType | CommandDone | CommandAny;

declare type SwarmReturnCode = ScreepsReturnCode | E_CATASTROPHIC;
declare type E_CATASTROPHIC = -16; declare const E_CATASTROPHIC = -16;