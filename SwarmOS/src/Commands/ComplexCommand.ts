import { LongCommand } from './CommandBase';

export class CommandLink {
    constructor(public CurrentCommand: ICommand) { }
    CommandMap: { commandResult: c_ComplexCommandResponse, followUp: ICommand }[];
    SetFollowUpCommand(condition: c_ComplexCommandResponse, followUp: ICommand) {
        this.CommandMap.push({ commandResult: condition, followUp: followUp });
    }
    Execute(...inArgs: any[]): SwarmReturnCode {
        return OK;
    }
}

export class CommandWeb extends LongCommand {

}