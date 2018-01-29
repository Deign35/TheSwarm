import { SimpleMemory } from "Memory/MemoryWrappers";

export class FrameCommand implements ICommand {
    Execute() {
        throw new Error("Method not implemented.");
    }
    CommandLoop: CommandFunc;
}

export abstract class CommandBase extends SimpleMemory implements ICommand {
    protected abstract ConstructCommandArgs(): any[];
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
    }
}

export abstract class SimpleCommand<T extends SimpleCommands> extends CommandBase {
    // Simple command is a single action that completes and goes away forever.
}

export abstract class ComplexCommand extends CommandBase {
    // Complex command is a set of actions to be completed.
}

function ImplementationMissing(obj: ICommand, ...args: any[]) {
    if (obj) {
        throw 'Implementation for Command is missing: ' + JSON.stringify(obj) + ' -- ' + JSON.stringify(args);
    }

    return ERR_NOT_FOUND;
}