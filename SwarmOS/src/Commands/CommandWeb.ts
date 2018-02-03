import { Swarmling } from 'SwarmTypes/Swarmling';
import { SwarmMemory } from 'Memory/SwarmMemory';

class CommandLink {
    private Links: { [result: number]: string };
    constructor(public CommandID: string, public CommandType: CommandType) { }

    SetNextCommand(commandResult: SwarmReturnCode, commandID: string) {
        this.Links[commandResult] = commandID;
    }

    ProcessCommandResult(commandResult: SwarmReturnCode) {
        if (this.Links[commandResult]) {
            return this.Links[commandResult];
        }
        return undefined;
    }
}

export class CommandWeb extends SwarmMemory implements ICommandWeb {
    static readonly AnyCommandID = 'ANY';
    static readonly EndCommandID = 'END';
    protected static EndCommand: CommandLink = new CommandLink(CommandWeb.EndCommandID, CommandComplete);

    protected LinksList: { [id: string]: CommandLink };
    DefaultCommand: string;

    SetCommands(linksList: { [commandID: string]: CommandType }, defaultCommand: string) {
        for (let commandId in linksList) {
            this.LinksList[commandId] = new CommandLink(commandId, linksList[commandId]);
        }
        this.LinksList[CommandWeb.AnyCommandID] = new CommandLink(CommandWeb.AnyCommandID, CommandAny);
        this.DefaultCommand = defaultCommand;
    }

    Save() {
        this.SetData('linksList', this.LinksList);
        this.SetData('DefaultCommand', this.DefaultCommand);
        super.Save();
    }

    Load() {
        super.Load();
        this.LinksList = this.GetData('linksList') || {};
        this.DefaultCommand = this.GetData('DefaultCommand') || CommandWeb.EndCommand;
    }

    SetCommandComplete(fromID: string, results: SwarmReturnCode[]) {
        this.SetCommandResponse(fromID, CommandWeb.EndCommandID, results);
    }

    SetCommandResponse(fromID: string, toID: string, results: SwarmReturnCode[]) {
        for (let result of results) {
            this.LinksList[fromID].SetNextCommand(result, toID);
        }
    }

    SetDefaultCommandResponse(toID: string, results: SwarmReturnCode[]) {
        this.SetCommandResponse(CommandWeb.AnyCommandID, toID, results);
    }

    SetForceEnd(results: SwarmReturnCode[]) {
        this.SetCommandResponse(CommandWeb.AnyCommandID, CommandWeb.EndCommandID, results);
    }

    GetCommandResult(fromID: string, result: SwarmReturnCode) {
        let toID = this.LinksList[fromID].ProcessCommandResult(result); // specific
        if (!toID) {
            toID = this.LinksList[CommandWeb.AnyCommandID].ProcessCommandResult(result); // general
            if (!toID) {
                toID = this.DefaultCommand;
            }
        }
        return toID;
    }

    GetCommandType(commandID: string) {
        return this.LinksList[commandID].CommandType;
    }

    /*
    ProcessSwarmling(ling: Swarmling, commandMemory: IMemory) {
        let curID = commandMemory.GetData('CmdID');
        let args = BasicCreepCommand.ConstructCommandArgs(commandMemory.GetData('CmdArgs')); // FIX THIS!!!
        let commandResult = BasicCreepCommand.ExecuteCreepCommand(this.LinksList[curID].CommandType, ling, args);
        let nextCommand = this.LinksList[curID].ProcessCommandResult(commandResult);
        if (nextCommand)
            commandMemory.SetData('CmdID', nextCommand);
    }
    */
}