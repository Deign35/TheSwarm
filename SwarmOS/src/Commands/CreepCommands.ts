declare type C_Attack = 'At';
declare type C_Build = 'Bu';
declare type C_Dismantle = 'Di';
declare type C_Drop = 'Dr';
declare type C_Harvest = 'Ha';
declare type C_Heal = 'He';
declare type C_Pickup = 'Pi';
declare type C_RangedAttack = 'RA';
declare type C_RangedHeal = 'RH';
declare type C_Repair = 'Re';
declare type C_Say = 'Sa';
declare type C_Suicide = 'Su';
declare type C_Transfer = 'Tr';
declare type C_Upgrade = 'Up';
declare type C_Withdraw = 'Wi';

declare type BasicCreepCommands = C_Attack | C_Build | C_Dismantle | C_Drop |
    C_Harvest | C_Heal | C_Pickup | C_RangedAttack |
    C_RangedHeal | C_Repair | C_Say | C_Suicide |
    C_Transfer | C_Upgrade | C_Withdraw;

declare enum c_SimpleCreep { // Reduce the amount of memory taken up by shortening the string and mapping by CPU.
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