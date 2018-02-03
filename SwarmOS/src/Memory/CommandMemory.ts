import { SwarmMemory } from "Memory/SwarmMemory";

const ASSIGNED_CREEP = 'AC';
const COMMAND_ARGS = 'CA';
const COMMAND_ID = 'CI';

export class CommandMemory extends SwarmMemory {
    SetNextCommand(nextID: string) {
        this.CommandArgs = {};
        this.CurCommandID = nextID;
    }
    get CommandArgs() {
        return this.GetData(COMMAND_ARGS);
    }
    set CommandArgs(cmdArgs: Dictionary) {
        this.SetData(COMMAND_ARGS, cmdArgs);
    }
    get CurCommandID() {
        return this.GetData(COMMAND_ID);
    }
    set CurCommandID(name: string) {
        this.SetData(COMMAND_ID, name);
    }
    get CreepName() {
        return this.GetData(ASSIGNED_CREEP);
    }
    set CreepName(name: string) {
        this.SetData(ASSIGNED_CREEP, name);
    }

    Validate(): JobResults {
        if (!this.CreepName || !Game.creeps[this.CreepName]) {
            return JobResults.RequiresCreep;
        }
        return JobResults.Continue;
    }
}