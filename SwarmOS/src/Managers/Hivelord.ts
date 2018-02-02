import { SimpleMemory } from "Memory/MemoryWrappers";
//import { ComplexCommand } from "Commands/ComplexCommand";

export class Hivelord extends SimpleMemory {
    //HiveCommand: ComplexCommand[];

    constructor(id: string) {
        super(id);
    }

    Evaluate() {

    }
}
/*const Command = function Command() {
    this.commandArguments = {}; // Change the name of commandArgs to ensure no one is attempting to access it directly.
    this.InitCache();
};

Command.prototype.InitCache = function() {
    this.Cache = {};
    this.Cache[CommandMemory_Enum.TargetList] = [];
    this.Cache[CommandMemory_Enum.ActionIndex] = 0;
    this.Cache[CommandMemory_Enum.RetryCount] = 0;
}

Command.prototype.SetArgument = function(argId, value) {
    this.commandArguments[argId] = value;
}

Command.prototype.GetArgument = function (argId) {
    return this.commandArguments[argId] || {}; // default empty obj????
}

Command.prototype.ToData = function () {
    const CommandData = {
        CommandArgs: this.commandArguments,
        Cache: this.Cache,
    }

    return CommandData;
}

Command.FromData = function (commandData) {
    let newCommand = new Command();
    newCommand.commandArguments = commandData['CommandArgs'];
    newCommand.Cache = commandData['Cache'];
    return newCommand;
}

Command.prototype.Evaluate = function () {
    if (!this.Cache[CommandMemory_Enum.Slave]) { return CommandResults_Enum.ContractorRequired; }
    // Need a callback delegate here.  Perhaps directly to the object the request was made for/by?
    // Or does the callback delegate go to the command fulfiller?
    const creep = Game.creeps[this.Cache[CommandMemory_Enum.Slave]];
    if (!creep) { return CommandResults_Enum.ContractorRequired; }
    if (creep.spawning) { return OK; }
    StartFunction('Command.Evaluate');
    let commandResult = CommandResults_Enum.Incomplete;

    let executionResult = creep.ExecuteCommand(this);
    let command = this.GetArgument(CommandArgs_Enum.ActionList)[this.Cache[CommandMemory_Enum.ActionIndex]];
    let response = CreepCommandResponse_Enum.Retry;

    const customResponses = command[ActionArgs_Enum.Responses];
    if (customResponses && customResponses[executionResult[CommandExecutionResult_Enum.ActionResult]]) {
        response = customResponses[executionResult[CommandExecutionResult_Enum.ActionResult]];
    } else {
        const defaultResponses = ActionTemplates[ActionArgs_Enum.Responses][executionResult[CommandExecutionResult_Enum.ActionCommand]];

        if (!defaultResponses[executionResult[CommandExecutionResult_Enum.ActionResult]]) {
            console.log('DO NOT KNOW HOW TO PROCESS THIS');
            throw Error('Command to do ' + command[ActionArgs_Enum.Action] + ' couldnt handle response ' + executionResult[CommandExecutionResult_Enum.ActionResult]);
        }

        response = defaultResponses[executionResult[CommandExecutionResult_Enum.ActionResult]];
    }

    if (response == CreepCommandResponse_Enum.Move) {
        // (TODO): Need to find a good way to cache this.
        let pathResult = creep.pos.findPathTo(executionResult[CommandExecutionResult_Enum.Target].pos, {
            visualizePathStyle: {
                fill: 'transparent',
                stroke: 'green', // Const?
                //lineStyle: 'undefined',
                strokeWidth: .2,
                opacity: .7
            },
            reusePath: 5,

        });
        let moveResult = creep.moveByPath(pathResult);
        // Do the move check here and translate responseResult to something else if needed.
        // i.e. if NO PATH -> response = Next
        /*if (moveResult == ERR_NO_PATH) {
            response = CreepCommandResponse_Enum.Next;
        }
        commandResult = CommandResults_Enum.Incomplete;
    }
if (response == CreepCommandResponse_Enum.ReqTarget) {
    delete this.Cache[CommandMemory_Enum.TargetId];
    delete this.Cache[CommandMemory_Enum.TargetPos];
    response = CreepCommandResponse_Enum.Retry;
}

if (response == CreepCommandResponse_Enum.Continue) {
    // do nothing
    commandResult = CommandResults_Enum.Incomplete;
}

if (response == CreepCommandResponse_Enum.Retry) { // Uncertain if Retry works or not.  Needs confirmation.
    console.log(this.Cache[CommandMemory_Enum.RetryCount]);
    if (this.Cache[CommandMemory_Enum.RetryCount] < 5) {
        this.Cache[CommandMemory_Enum.RetryCount] += 1;
        commandResult = CommandResults_Enum.Incomplete;
    } else {
        response = CreepCommandResponse_Enum.Complete;
        console.log(this.name + ' retry max.(' + command.id + ')');
        this.Cache[CommandMemory_Enum.RetryCount] = 0;
    }
} else {
    this.Cache[CommandMemory_Enum.RetryCount] = 0;
}

if (response == CreepCommandResponse_Enum.Complete) {
    // Need to end the command completely.  It is complete.
    commandResult = CommandResults_Enum.Complete;
}

if (response == CreepCommandResponse_Enum.Next) {
    let actionIndex = this.Cache[CommandMemory_Enum.ActionIndex];
    let slave = this.Cache[CommandMemory_Enum.Slave];
    this.InitCache();

    const actionCount = this.GetArgument(CommandArgs_Enum.ActionList).length;
    if (++actionIndex == actionCount) {
        actionIndex = 0;
    }

    this.Cache[CommandMemory_Enum.ActionIndex] = actionIndex;
    this.Cache[CommandMemory_Enum.Slave] = slave;
    commandResult = CommandResults_Enum.Retry;
}

if (response == CreepCommandResponse_Enum.Reset) {
    let slave = this.Cache[CommandMemory_Enum.Slave];
    this.InitCache();
    this.Cache[CommandMemory_Enum.Slave] = slave;
    commandResult = CommandResults_Enum.Incomplete;
}

EndFunction();
return commandResult;
};

module.exports = Command; */