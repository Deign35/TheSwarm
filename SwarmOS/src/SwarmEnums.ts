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

export type CreepActionType = C_Attack | C_Build | C_Dismantle | C_Harvest | C_Heal | C_Pickup | C_RangedAttack |
    C_RangedHeal | C_Repair | C_Say | C_Suicide | C_Transfer | C_Upgrade | C_Withdraw;
export type SwarmReturnCode = ScreepsReturnCode;

export const CRT_None = -1000; declare type CRT_None = -1000;
export const CRT_Next = -1001; declare type CRT_Next = -1001;
export const CRT_Move = -1004; declare type CRT_Move = -1004;
export const CRT_NewTarget = -1005; declare type CRT_NewTarget = -1005;
export type BasicCommandResponseType = CRT_None | CRT_Next | CRT_Move | CRT_NewTarget;

export const CRT_Condition_Empty = -1203; declare type CRT_Condition_Empty = -1203;
export const CRT_Condition_Full = -1205; declare type CRT_Condition_Full = -1205;
export type ConditionCommandResponseType = CRT_Condition_Empty | CRT_Condition_Full;

export const CRT_Requires_Creep = -1301; declare type CRT_Requires_Creep = -1301;
export type RequiresConditionCommandResponseType = CRT_Requires_Creep;

export type CommandResponseType = BasicCommandResponseType | ConditionCommandResponseType | RequiresConditionCommandResponseType;

export enum CreepBodyType {
    Custom,
    LittleHarvester,
    PrimeHarvester,
}