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

declare enum c_SimpleCreep { // Reduce the amount of memory taken up by shortening the string and mapping by CPU.
    Attack = 'attack',
    Build = 'build',
    Dismantle = 'dismantle',
    Drop = 'drop',
    Harvest = 'harvest',
    Heal = 'heal',
    Pickup = 'pickup',
    RangedAttack = 'rangedAttack',
    RangedHeal = 'rangedHeal',
    Repair = 'repair',
    Say = 'say',
    Suicide = 'suicide',
    Transfer = 'transfer',
    Upgrade = 'upgradeController',
    Withdraw = 'withdraw',
}

declare enum c_SimpleRoom {

}

declare type SimpleCommands = c_SimpleCreep | c_SimpleRoom;