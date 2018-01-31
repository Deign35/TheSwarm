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

export abstract class SimpleCommand extends FrameCommand {
    // Simple command is a single action that completes and goes away forever.
}

export abstract class ComplexCommand extends FrameCommand {
    // Complex command is a set of actions to be completed.
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
