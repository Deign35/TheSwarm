import { SimpleMemory } from "Memory/MemoryWrappers";

export class FrameCommand implements ICommand {
    protected ConstructCommandArgs(args: { [name: string]: any }): { [name: string]: any } {
        return args;
    }
    constructor(public CommandType: CommandType, public CommandLoop: CommandFunc = ImplementationMissing) { }

    Execute(...inArgs: any[]) {
        let result = ERR_INVALID_ARGS as ScreepsReturnCode;
        try {
            result = this.CommandLoop(this.ConstructCommandArgs({}));
        } catch (e) {
            console.log('Command Failed: ' + e);
        }

        return ERR_INVALID_ARGS;
    }
}

export abstract class LongCommand extends SimpleMemory implements ICommand {
    protected abstract ConstructCommandArgs(args: { [name: string]: any }): { [name: string]: any }
    constructor(id: string, public CommandType: CommandType, public CommandLoop: CommandFunc = ImplementationMissing) {
        super(id);
    }

    Execute(...inArgs: any[]): ScreepsReturnCode {
        let result = ERR_INVALID_ARGS as ScreepsReturnCode;
        try {
            result = this.CommandLoop(this.ConstructCommandArgs({}));
        } catch (e) {
            console.log('Command Failed: ' + e);
        }

        return ERR_INVALID_ARGS;
    }
}

export abstract class ComplexCommand extends LongCommand {
    CommandMap: { commandResult: c_ComplexCommandResponse, followUp: ICommand }[];
    SetFollowUpCommand(condition: c_ComplexCommandResponse, followUp: ICommand) {
        this.CommandMap.push({ commandResult: condition, followUp: followUp });
    }
    Execute(...inArgs: any[]): ScreepsReturnCode {
        return OK;
    }
}

function ImplementationMissing(obj: ICommand, ...args: any[]) {
    if (obj) {
        throw 'Implementation for Command is missing: ' + JSON.stringify(obj) + ' -- ' + JSON.stringify(args);
    }

    return ERR_NOT_FOUND;
}

//There should also be const commands that don't need to be constructed, but are just callable.
/*export abstract class CommandBase extends SimpleMemory implements FrameCommand {
    ConstructCommandArgs(...args: any[]) {
        return args;
    }
    constructor(id: string, public CommandLoop: CommandFunc = ImplementationMissing) {
        super(id);
    }

    Execute() {
        let result = ERR_INVALID_ARGS as ScreepsReturnCode;
        try {
            result = this.CommandLoop(this.ConstructCommandArgs);
        } catch (e) {
            console.log('Command Failed: ' + e);
        }

        return ERR_INVALID_ARGS;
    }
}*/
