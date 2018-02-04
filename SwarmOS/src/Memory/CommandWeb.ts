import { SwarmMemory } from 'Memory/SwarmMemory';
import * as SwarmEnums from 'SwarmEnums';

class CommandLink {
    private Links: { [result: number]: string } = {};
    constructor(public CommandType: SwarmEnums.CommandType) { }

    SetNextCommand(commandResult: SwarmEnums.SwarmReturnCode, commandID: string) {
        this.Links[commandResult] = commandID;
    }

    ProcessCommandResult(commandResult: SwarmEnums.SwarmReturnCode) {
        if (this.Links[commandResult]) {
            return this.Links[commandResult];
        }
        return undefined;
    }
}

export class CommandWeb extends SwarmMemory implements ICommandWeb {
    static readonly AnyCommandID = 'ANY';
    static readonly EndCommandID = 'END';
    protected static EndCommand: CommandLink = new CommandLink(SwarmEnums.CommandEnd);

    protected LinksList: { [id: string]: CommandLink };
    DefaultCommand: string;

    SetCommands(linksList: { [commandID: string]: SwarmEnums.CommandType }, defaultCommand: string) {
        for (let commandId in linksList) {
            this.LinksList[commandId] = new CommandLink(linksList[commandId]);
        }
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

    SetCommandComplete(fromID: string, results: SwarmEnums.SwarmReturnCode[]) {
        this.SetCommandResponse(fromID, CommandWeb.EndCommandID, results);
    }

    SetCommandResponse(fromID: string, toID: string, results: SwarmEnums.SwarmReturnCode[]) {
        for (let result of results) {
            this.LinksList[fromID].SetNextCommand(result, toID);
        }
    }

    SetDefaultCommandResponse(toID: string, results: SwarmEnums.SwarmReturnCode[]) {
        if (!this.LinksList[CommandWeb.AnyCommandID]) {
            this.LinksList[CommandWeb.AnyCommandID] = new CommandLink(SwarmEnums.CommandAny);
        }
        this.SetCommandResponse(CommandWeb.AnyCommandID, toID, results);
    }

    SetForceEnd(results: SwarmEnums.SwarmReturnCode[]) {
        if (!this.LinksList[CommandWeb.AnyCommandID]) {
            this.LinksList[CommandWeb.AnyCommandID] = new CommandLink(SwarmEnums.CommandAny);
        }
        this.SetCommandResponse(CommandWeb.AnyCommandID, CommandWeb.EndCommandID, results);
    }

    Comand result is broken here
GetCommandResult(fromID: string, result: SwarmEnums.SwarmReturnCode) {
    let toID = this.LinksList[fromID].ProcessCommandResult(result); // specific
    if (!toID) {
        if (!this.LinksList[CommandWeb.AnyCommandID]) {
            toID = this.DefaultCommand;
        } else {
            toID = this.LinksList[CommandWeb.AnyCommandID].ProcessCommandResult(result); // general
            if (!toID) {
                toID = this.DefaultCommand;
            }
        }
    }
    return toID;
}

GetCommandType(commandID: string) {
    return this.LinksList[commandID].CommandType;
}
}