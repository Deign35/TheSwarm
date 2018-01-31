import { LongCommand } from './CommandBase';

export abstract class ComplexCommand extends LongCommand {
    CommandMap: { commandResult: c_ComplexCommandResponse, followUp: ICommand }[];
    SetFollowUpCommand(condition: c_ComplexCommandResponse, followUp: ICommand) {
        this.CommandMap.push({ commandResult: condition, followUp: followUp });
    }
    Execute(...inArgs: any[]): SwarmReturnCode {
        return OK;
    }
}