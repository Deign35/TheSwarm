export const C_NONE = 0; declare type C_NONE = 0;
export const C_MOVE = 1; declare type C_MOVE = 1;

declare type SwarmlingResponse = C_NONE | C_MOVE;

export const E_INVALID = -1; declare type E_INVALID = -1;
export const E_MISSING_TARGET = -2; declare type E_MISSING_TARGET = -2;


declare type SwarmErrors = E_INVALID | E_MISSING_TARGET;