import { SwarmMemory } from "Memory/SwarmMemory";
import { CreepCommandType } from "SwarmEnums";

const CON_CREEP_FULL = -100; declare type CON_CREEP_FULL = -100;
const CON_CREEP_EMPTY = -101; declare type CON_CREEP_EMPTY = -101;
const CON_NO_NEW_TARGET = -102; declare type CON_NO_NEW_TARGET = -102;
const CON_TARGET_EMPTY = -103; declare type CON_TARGET_EMPTY = -103;
const CON_TARGET_FULL = -104; declare type CON_TARGET_FULL = -104;
const CON_CREEP_MIN_RES = -105; declare type CON_MIN_RES = -105;
const CON_TARGET_MIN_RES = -106; declare type CON_TARGET_MIN_RES = -106;
const CON_ROOM_MIN_RES = -107; declare type CON_ROOM_MIN_RES = -107;
const CON_NEAR_DEATH = -108; declare type CON_NEAR_DEATH = -108;

declare interface IDirectiveMemory extends SwarmMemory {
    SetCondition(condition: string, responseCommand: string): void;
    GetCustomResponse(condition: string): string;
}
export class DirectiveMemory extends SwarmMemory implements IDirectiveMemory {
    CommandType: CreepCommandType;
    SetCondition(condition: string, responseCommand: string): void {
        this.SetData(condition, responseCommand);
    }
    GetCustomResponse(condition: string) {
        return this.GetData(condition);
    }
}