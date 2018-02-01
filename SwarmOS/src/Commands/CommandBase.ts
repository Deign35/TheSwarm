import { SimpleMemory } from "Memory/MemoryWrappers";

export class ShortCommand implements ICommand {
    protected ConstructCommandArgs(args: { [name: string]: any }): { [name: string]: any } {
        return args;
    }
    constructor(public CommandType: CommandType, public CommandLoop: CommandFunc = ImplementationMissing) { }

    Execute(...inArgs: any[]): ScreepsReturnCode {
        let result = ERR_INVALID_ARGS as SwarmReturnCode;
        try {
            result = this.CommandLoop(inArgs);
        } catch (e) {
            console.log('Command Failed: ' + e);
        }

        return result;
    }
}

export abstract class LongCommand extends SimpleMemory implements ICommand {
    constructor(id: string, public CommandType: CommandType, public CommandLoop: CommandFunc = ImplementationMissing) {
        super(id);
    }

    Execute(...inArgs: any[]): SwarmReturnCode {
        let result = ERR_INVALID_ARGS as SwarmReturnCode;
        try {
            result = this.CommandLoop();
        } catch (e) {
            console.log('Command Failed: ' + e);
        }

        return result;
    }
}

function ImplementationMissing(obj: ICommand, ...args: any[]) {
    if (obj) {
        throw 'Implementation for Command is missing: ' + JSON.stringify(obj) + ' -- ' + JSON.stringify(args);
    }

    return ERR_NOT_FOUND;
}