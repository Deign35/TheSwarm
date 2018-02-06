import { SwarmMemory } from "Memory/SwarmMemory";
import { CreepCommandType, SwarmReturnCode, CmdNodeType, CommandResponseType, CRT_None, CRT_Terminate, CRT_Next, CRT_Restart, BasicCreepCommandType, CRT_Move, CRT_Retry, C_Harvest, CRT_Condition_Full, C_Transfer, CRT_Condition_Empty, C_Withdraw, CRT_Retry_NewTarget, C_Pickup, CommandEnd, CRT_UNEXPECTED } from "SwarmEnums";

let DefaultOverrides:{ [commandType: string]: {[result: number]: CommandResponseType}} = {};
DefaultOverrides[BasicCreepCommandType.C_Harvest] = {};
DefaultOverrides[BasicCreepCommandType.C_Harvest][OK] = CRT_Condition_Full;
DefaultOverrides[BasicCreepCommandType.C_Harvest][ERR_NOT_ENOUGH_RESOURCES] = CRT_Retry_NewTarget;
DefaultOverrides[BasicCreepCommandType.C_Harvest][ERR_FULL] = CRT_Next;

DefaultOverrides[BasicCreepCommandType.C_Withdraw] = {};
DefaultOverrides[BasicCreepCommandType.C_Withdraw][OK] = CRT_Condition_Full;
DefaultOverrides[BasicCreepCommandType.C_Withdraw][ERR_NOT_ENOUGH_RESOURCES] = CRT_Retry_NewTarget;
DefaultOverrides[BasicCreepCommandType.C_Withdraw][ERR_FULL] = CRT_Next;

DefaultOverrides[BasicCreepCommandType.C_Transfer] = {};
DefaultOverrides[BasicCreepCommandType.C_Transfer][OK] = CRT_Condition_Empty;
DefaultOverrides[BasicCreepCommandType.C_Transfer][ERR_NOT_ENOUGH_RESOURCES] = CRT_Next;
DefaultOverrides[BasicCreepCommandType.C_Transfer][ERR_FULL] = CRT_Retry_NewTarget;

const CMD_TYPE = 'cmd';
const CUSTOM_RESPONSES = 'cus';
const CONNECTIONS = 'con';
export class CmdNode extends SwarmMemory {
    CmdType: CreepCommandType;
    private customResponses: { [result: number]: CommandResponseType };
    private connections: { [responseType: number]: string };

    Save() {
        this.SetData(CMD_TYPE, this.CmdType);
        this.SetData(CUSTOM_RESPONSES, this.customResponses);
        this.SetData(CONNECTIONS, this.connections);
        super.Save();
    }
    Load() {
        super.Load();
        this.CmdType = this.GetData(CMD_TYPE);
        this.customResponses = this.GetData(CUSTOM_RESPONSES);
        this.connections = this.GetData(CONNECTIONS);
    }

    private GetDefaultResponse(result: SwarmReturnCode): CommandResponseType {
        if(DefaultOverrides[this.CmdType] && DefaultOverrides[this.CmdType][result]) {
            return DefaultOverrides[this.CmdType][result];
        }
        switch(result) {
            case(ERR_NOT_IN_RANGE):/* -9 */ return CRT_Move;
            case(ERR_NO_PATH):/* -2 */
            case(ERR_NOT_FOUND):/* -5 */
            case(ERR_INVALID_TARGET):/* -7 */ return CRT_Retry;
            case(ERR_INVALID_ARGS):/* -10 */ return CRT_Restart;

            case(ERR_NO_BODYPART):/* -12 */
            case(ERR_NOT_OWNER):/* -1 */
            case(ERR_RCL_NOT_ENOUGH):/* -14 */
            case(ERR_GCL_NOT_ENOUGH):/* -15 */ return CRT_Terminate;

            case(OK):/* 0 */
            case(ERR_NOT_ENOUGH_RESOURCES):/* -6 */
            case(ERR_FULL):/* -8 */
                if(DefaultOverrides[this.CmdType]) { // This is only possible because current commands that need overrides all fit this pattern.
                    return DefaultOverrides[this.CmdType][result];
                }
                break;
            //case(ERR_NAME_EXISTS):/* -3 */ break;
            //case(ERR_BUSY):/* -4 */ break;
            //case(ERR_TIRED):/* -11 */ break;
        }

        return CRT_None;
    }
    GetResponse(result: SwarmReturnCode): CommandResponseType {
        let response = CRT_None as CommandResponseType;
        if(this.customResponses[result]) {
            response = this.customResponses[result];
        } else {
            response = this.GetDefaultResponse(result);
        }
        return response;
    }
    SetResponse(when: SwarmReturnCode, respondWith: CommandResponseType): void {
        this.customResponses[when] = respondWith;
    }
    GetGoTo(response: CommandResponseType): string | undefined {
        return this.connections[response] || undefined;
    }
    SetGoTo(response: CommandResponseType, nextCommand: string) {
        this.connections[response] = nextCommand;
    }
}

const JOB_IDS = 'IDs';
const FAIL_ID = 'JOB MEMORY FAILURE';
export class JobMemory extends SwarmMemory {
    static readonly AnyCommandID = 'ANY';
    static readonly EndCommandID = 'END';
    private JobResponses: {[name: string]: CmdNode };

    Save() {
        let jobIds: string[] = [];
        this.ForEach(function(name: string, item: CmdNode) {
            jobIds.push(name);
            item.Save();
        });
        this.SetData(JOB_IDS, jobIds);
        super.Save();
    }
    Load() {
        super.Load();
        let jobIds = this.GetData(JOB_IDS);
        this.JobResponses = {};
        for(let i = 0, length = jobIds.length; i < length; i++) {
            this.JobResponses[jobIds[i]] = new CmdNode(jobIds[i], this);
        }
    }

    AddCommand(commandID: string, commandType: CreepCommandType) {
        this.JobResponses[commandID] = new CmdNode(commandType);
    }

    SetConnection(fromID: string, toID: string, when: CommandResponseType) {
        this.JobResponses[fromID].SetGoTo(when, toID);
    }
    SetCustomResponse(commandID: string, result: SwarmReturnCode, response: CommandResponseType) {
        this.JobResponses[commandID].SetResponse(result, response);
    }

    GetJobResponse(commandID: string, result: SwarmReturnCode) : CommandResponseType {
        return this.JobResponses[commandID].GetResponse(result) || CRT_UNEXPECTED;
    }
    GetCommandType(commandID: string) {
        return this.JobResponses[commandID];
    }
}
/*
// INSTEAD OF PER HIVELORD, LET JOBS BE POSTED SEPARATELY AND SIGNED UP TO BY HIVELORDS
// Any targets should be referenced by a targetID processed by the TargetMemory.
JB = new JobMemory(<memID>, <HiveQueen.JobPostings>);
JB.AddCommand('P1', C_Pickup);
JB.AddCommand('H1', C_Harvest);
JB.AddCommand('T1', C_Transfer);
JB.AddCommand('U1', C_Upgrade);
JB.AddCommand('H2', C_Harvest);
JB.AddCommand('B1', C_Build);

JB.SetConnection('P1', 'H1', CRT_Next);
JB.SetConnection('H1', 'T1', CRT_Next);
JB.SetConnection('T1', 'U1', CRT_Next);
JB.SetConnection('U1', 'H2', CRT_Next);
JB.SetConnection('H2', 'B1', CRT_Next);

**********************************************************************************************************
The answer lays in here.
Use the conditions instead of response type.
Conditions can include args.  E.g. CRT_Condition_MinEnergy might pass 100 as the arg, to mean the min energy must be 100, and it will do such and such.
Conditions should be able to be compound conditions as well.
Oh boy...

JobMemory.Example = {
    'Cmd1': {
        CmdType: C_Harvest ('Ha'),
        OK: {
            CRT_Condition_Full: 'Cmd2',
        }
    },
    'Cmd2': {
        CmdType: C_Transfer ('Tr'),
        OK: { // Are the return codes important?  Or do I just care about conditions?
            // conceivably...what about CRT_Condition_ReturnCode
            CRT_Condition_Empty: 'Cmd1',
            CRT_Condition_NoTargets: 'Cmd3',
        }
        ERR_FULL: {
            CRT_Condition_NoTargets: 'Cmd3',
        }
    },
    'Cmd3': {
        CmdType: C_Build ('Bu'),
        CRT_Condition_Empty: 'Cmd1',
        CRT_Condition_NoTargets: 'Cmd4',
    }
    'Cmd4': {
        CmdType: C_Upgrade ('Up'),
        CRT_Condition_Empty: 'Cmd1',
        CRT_AvailableTargets('Cmd2', 'Cmd3'): ('Cmd2' or 'Cmd3'),

    }
}
**********************************************************************************************************
JB.SetConnection('B1', JobMemory.EndCommandID, CRT_Next);
JB.SetConnection('B1', 'T1', CRT_Condition_Not_Empty);

JB.SetCustomResponse('B1', ERR_NO_TARGET, CRT_Condition_Not_Empty);
**********************************************************************************************************

Tries to pickup, then harvest until it is full.  Then it will try to transfer all of its energy.  If it is unable to empty, it will then upgrade the controller
Once the creep has no more energy, he will go and Harvest again and use that energy to build.

let result = BasicCreepCommand.ExecuteCreepAction(JB.GetCommandType(<jobIndex>));


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
}*/