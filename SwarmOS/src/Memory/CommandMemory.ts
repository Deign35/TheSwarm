import { SwarmMemory } from "Memory/SwarmMemory";

const ASSIGNED_CREEP = 'AC';
const COMMAND_ARGS = 'CA';

export class CommandMemory extends SwarmMemory {
    get CommandArgs() {
        return this.GetData(COMMAND_ARGS);
    }
    set CommandArgs(cmdArgs: Dictionary) {
        this.SetData(COMMAND_ARGS, cmdArgs);
    }
    set CreepName(name: string) {
        this.SetData(ASSIGNED_CREEP, name);
    }
    get CreepName() {
        return this.GetData(ASSIGNED_CREEP);
    }
}