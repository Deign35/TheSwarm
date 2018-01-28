export enum e_CResponse {
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

export enum t_Target {
    FT, // Fixed Target
    CB, // Callback
    NS, // Nearest Structure
    Fi, // Find Target
    AP, // At Position
}
