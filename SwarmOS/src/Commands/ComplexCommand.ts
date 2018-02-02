import { LongCommand } from './CommandBase';
import { Swarmling } from 'SwarmTypes/Swarmling';

export class CommandLink {
    private Links: { [result: number]: string };
    constructor(public CommandID: string, public CommandType: CommandType) { }

    SetNextCommand(commandResult: SwarmReturnCode, commandID: string) {
        this.Links[commandResult] = commandID;
    }

    ProcessCommandResult(commandResult: SwarmReturnCode) {
        if (this.Links[commandResult]) {
            return this.Links[commandResult];
        }
        return this.CommandID;
    }

}

export class CommandWeb {
    static readonly EndCommandID = 'END';
    static EndCommand: CommandLink = new CommandLink(CommandWeb.EndCommandID, CommandComplete);

    protected LinksList: { [id: string]: CommandLink } = {};
    constructor(public WebID: string, linksList: { [commandID: string]: CommandType }) {
        for (let commandId in linksList) {
            this.LinksList[commandId] = new CommandLink(commandId, linksList[commandId]);
        }
    }

    SetCommandComplete(fromID: string, results: SwarmReturnCode[]) {
        this.SetCommandResult(fromID, CommandWeb.EndCommandID, results);
    }

    SetCommandResult(fromID: string, toID: string, results: SwarmReturnCode[]) {
        for (let result of results) {
            this.LinksList[fromID].SetNextCommand(result, toID);
        }
    }

    GetCommandResult(fromID: string, result: SwarmReturnCode) {
        return this.LinksList[fromID].ProcessCommandResult(result);
    }

    GetCommandType(commandID: string) {
        return this.LinksList[commandID].CommandType;
    }

    /*ProcessSwarmling(ling: Swarmling, commandMemory: IMemory) {
        let curID = commandMemory.GetData('CmdID');
        let args = BasicCreepCommand.ConstructCommandArgs(commandMemory.GetData('CmdArgs')); // FIX THIS!!!
        let commandResult = BasicCreepCommand.ExecuteCreepCommand(this.LinksList[curID].CommandType, ling, args);
        let nextCommand = this.LinksList[curID].ProcessCommandResult(commandResult);
        if (nextCommand)
            commandMemory.SetData('CmdID', nextCommand);
    }*/
}