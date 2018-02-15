export const C_NONE = 0; declare type C_NONE = 0;
export const C_MOVE = 1; declare type C_MOVE = 1;

export type SwarmlingResponse = C_NONE | C_MOVE | SwarmErrors;

export const E_INVALID = -1; declare type E_INVALID = -1;
export const E_MISSING_TARGET = -2; declare type E_MISSING_TARGET = -2;
export const E_REQUIRES_ENERGY = -3; declare type E_REQUIRES_ENERGY = -3;
export const E_TARGET_INELLIGIBLE = -4; declare type E_TARGET_INELLIGIBLE = -4
export const E_ACTION_UNNECESSARY = -5; declare type E_ACTION_UNNECESSARY = -5;

export type SwarmErrors = E_INVALID | E_MISSING_TARGET | E_REQUIRES_ENERGY | E_TARGET_INELLIGIBLE | E_ACTION_UNNECESSARY;