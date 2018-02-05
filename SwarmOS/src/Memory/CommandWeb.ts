import { SwarmMemory } from 'Memory/SwarmMemory';
import * as SwarmEnums from 'SwarmEnums';
import { CommandType, GenericResponses, CommandResponseType, CommandEnd } from 'SwarmEnums';

const LINK_DATA = 'LD';
const LINK_TYPE = 'LT';
class CommandLink extends SwarmMemory {
    LinkCommandType: CommandType;
    protected Links: { [result: number]: string };
    Save() {
        this.SetData(LINK_TYPE, this.LinkCommandType);
        this.SetData(LINK_DATA, this.Links);
        super.Save();
    }
    Load() {
        super.Load();
        this.LinkCommandType = this.GetData(LINK_TYPE);
        this.Links = this.GetData(LINK_DATA) || {};
    }

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

    protected LinkMemory: SwarmMemory;
    protected LinksList: { [id: string]: CommandLink };
    DefaultCommand: string;

    SetCommands(linksList: { [commandID: string]: SwarmEnums.CommandType }, defaultCommand: string) {
        for (let commandID in linksList) {
            this.LinksList[commandID] = new CommandLink(commandID, this.LinkMemory);
            this.LinksList[commandID].LinkCommandType = linksList[commandID];
        }
        this.DefaultCommand = defaultCommand;
    }
    AddCommand(commandID: string, commandType: SwarmEnums.CommandType) {
        this.LinksList[commandID] = new CommandLink(commandID, this.LinkMemory);
        this.LinksList[commandID].LinkCommandType = commandType;
    }

    Save() {
        let linkIDs = [];
        for (let name in this.LinksList) {
            this.LinksList[name].Save();
            linkIDs.push(name);
        }
        this.LinkMemory.SetData('linkIDs', linkIDs);
        this.SetData('DefaultCommand', this.DefaultCommand);
        this.LinkMemory.Save();
        super.Save();
    }

    Load() {
        super.Load();
        this.LinkMemory = new SwarmMemory('LinkData', this);
        this.LinksList = {};
        let linkIDs = this.LinkMemory.GetData('linkIDs') || [];
        for (let i = 0, length = linkIDs.length; i < length; i++) {
            this.LinksList[linkIDs[i]] = new CommandLink(linkIDs[i], this.LinkMemory);
        }
        this.DefaultCommand = this.GetData('DefaultCommand') || CommandWeb.EndCommandID;
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
            this.LinksList[CommandWeb.AnyCommandID] = new CommandLink(SwarmEnums.CommandAny, this.LinkMemory);
        }
        this.SetCommandResponse(CommandWeb.AnyCommandID, toID, results);
    }

    SetForceEnd(results: SwarmEnums.SwarmReturnCode[]) {
        if (!this.LinksList[CommandWeb.AnyCommandID]) {
            this.LinksList[CommandWeb.AnyCommandID] = new CommandLink(SwarmEnums.CommandAny, this.LinkMemory);
        }
        this.SetCommandResponse(CommandWeb.AnyCommandID, CommandWeb.EndCommandID, results);
    }
    GetCommandResult(fromID: string, result: SwarmEnums.SwarmReturnCode) {
        let toID = this.LinksList[fromID].ProcessCommandResult(result); // specific
        if (!toID) {
            if (!this.LinksList[CommandWeb.AnyCommandID]) {
                toID = undefined;
            } else {
                toID = this.LinksList[CommandWeb.AnyCommandID].ProcessCommandResult(result); // general
                if (!toID) {
                    toID = undefined;
                }
            }
        }

        if (!toID) {
            let defaultResponse = GenericResponses[result];
            if (defaultResponse != CommandResponseType.Self) {
                if (defaultResponse == CommandResponseType.Next) {
                    let commandID = 1 + (+fromID.slice(1));
                    toID = '#' + commandID;
                    if (!this.LinksList[toID]) {
                        toID = CommandEnd;
                    }
                } else if (defaultResponse == CommandResponseType.Restart) {
                    toID = this.DefaultCommand;
                } else if (defaultResponse == CommandResponseType.Terminate) {
                    toID = CommandEnd;
                }
            }
        }
        if (toID) {
            console.log(Game.time + ': Result[' + result + '] - from[' + fromID + '] - To[' + toID + ']');
        }
        return toID;
    }

    GetCommandType(commandID: string) {
        return this.LinksList[commandID].LinkCommandType;
    }
}