

declare type C_Attack = 'At';       declare const C_Attack = 'At';
declare type C_Build = 'Bu';        declare const C_Build = 'Bu';
declare type C_Dismantle = 'Di';    declare const C_Dismantle = 'Di';
declare type C_Drop = 'Dr';         declare const C_Drop = 'Dr';
declare type C_Harvest = 'Ha';      declare const C_Harvest = 'Ha';
declare type C_Heal = 'He';         declare const C_Heal = 'He';
declare type C_Pickup = 'Pi';       declare const C_Pickup = 'Pi';
declare type C_RangedAttack = 'RA'; declare const C_RangedAttack = 'RA';
declare type C_RangedHeal = 'RH';   declare const C_RangedHeal = 'RH';
declare type C_Repair = 'Re';       declare const C_Repair = 'Re';
declare type C_Say = 'Sa';          declare const C_Say = 'Sa';
declare type C_Suicide = 'Su';      declare const C_Suicide = 'Su';
declare type C_Transfer = 'Tr';     declare const C_Transfer = 'Tr';
declare type C_Upgrade = 'Up';      declare const C_Upgrade = 'Up';
declare type C_Withdraw = 'Wi';     declare const C_Withdraw = 'Wi';

declare enum c_SimpleCreep {
    At = 'attack',
    Bu = 'build',
    Di = 'dismantle',
    Dr = 'drop',
    Ha = 'harvest',
    He = 'heal',
    Pi = 'pickup',
    RA = 'rangedAttack',
    RH = 'rangedHeal',
    Re = 'repair',
    Sa = 'say',
    Su = 'suicide',
    Tr = 'transfer',
    Up = 'upgradeController',
    Wi = 'withdraw',
}

declare type BasicCreepCommandTypes = C_Attack | C_Build | C_Dismantle | C_Drop |
    C_Harvest | C_Heal | C_Pickup | C_RangedAttack |
    C_RangedHeal | C_Repair | C_Say | C_Suicide |
    C_Transfer | C_Upgrade | C_Withdraw;

declare enum e_CResponse {
    Cn, // Continue
    Mv, // Move
    AC, // Action Complete
    Re, // Retry
    CP, // CheckPosition
    RS, // Reset
    CC, // Cancel Commands
    RT, // Requires a Target
    CM, // Complete
}

declare enum t_Target {
    FT, // Fixed Target
    CB, // Callback
    NS, // Nearest Structure
    Fi, // Find Target
    AP, // At Position
}

declare enum c_SimpleRoom {

}

declare type SimpleCommands = BasicCreepCommandTypes | c_SimpleRoom;