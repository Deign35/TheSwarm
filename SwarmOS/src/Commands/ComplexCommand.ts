import { LongCommand } from './CommandBase';
import { Swarmling } from 'SwarmTypes/Swarmling';
import { BasicCreepCommand } from 'Commands/BasicCreepCommand';

export class CommandLink {
    private Links: { [result: number]: string };
    constructor(public CommandID: string, public CommandType: CommandType) { }
    SetNextCommand(commandResult: ScreepsReturnCode, commandID: string) {
        this.Links[commandResult] = commandID;
    }
    SetEndCommand(commandResult: ScreepsReturnCode) {
        this.Links[commandResult] = CommandLink.EndCommand.CommandID
            ;
    }

    ProcessCommandResult(commandResult: ScreepsReturnCode) {
        if (this.Links[commandResult]) {
            return this.Links[commandResult];
        }
        return this.CommandID;
    }
    static EndCommand: CommandLink = new CommandLink('END', A_NewJob);
}

export class CommandWeb {
    private LinksList: { [id: string]: CommandLink } = {};
    constructor(public WebID: string, linksList: { [commandID: string]: CommandType }) {
        for (let commandId in linksList) {
            this.LinksList[commandId] = new CommandLink(commandId, linksList[commandId]);
        }
    }
    SetCommandResult(fromID: string, toID: string, results: ScreepsReturnCode[]) {
        for (let result of results) {
            this.LinksList[fromID].SetNextCommand(result, toID);
        }
    }

    ProcessSwarmling(ling: Swarmling, commandMemory: IMemory) {
        let curID = commandMemory.GetData('CmdID');
        let args = BasicCreepCommand.ConstructCommandArgs(commandMemory.GetData('CmdArgs')); // FIX THIS!!!
        let commandResult = BasicCreepCommand.ExecuteCreepCommand(this.LinksList[curID].CommandType, ling, args);
        let nextCommand = this.LinksList[curID].ProcessCommandResult(commandResult);
        if (nextCommand)
            commandMemory.SetData('CmdID', nextCommand);
    }
}