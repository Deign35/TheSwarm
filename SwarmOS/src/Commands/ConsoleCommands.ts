import { SwarmQueen } from "Managers/SwarmQueen";
import { SwarmJob } from "Hivelords/SwarmJob";
import { SwarmJobCreator } from "Commands/GenericRoles";

export class ConsoleCommands {
    static Reset() {
        Memory.INIT = false;
    }
    static CreateHarvester(body: BodyPartConstant[], target?: string) {
        let swarmQueen = SwarmQueen.LoadSwarmData();
        let hiveQueen = swarmQueen.HiveQueens['W1N7'];
        SwarmJobCreator.CreateHarvester(hiveQueen, body, target);
        swarmQueen.Save();
    }

    static CreateUpgrade(body: BodyPartConstant[]) {
        let swarmQueen = SwarmQueen.LoadSwarmData();
        let hiveQueen = swarmQueen.HiveQueens['W1N7'];
        SwarmJobCreator.CreateJob(hiveQueen, ['Ha', 'Up'], body);
        swarmQueen.Save();
    }

    static CreateJob(actions: string[], body: BodyPartConstant[]) {
        let swarmQueen = SwarmQueen.LoadSwarmData();
        let hiveQueen = swarmQueen.HiveQueens['sim'];
        SwarmJobCreator.CreateJob(hiveQueen, actions, body);
        swarmQueen.Save();
    }
    static Help() {
        let helpStr = 'TheSwarmOS Console Commands -----';
        helpStr += '\n' + ('-Reset - Hard reset for the entire OS')
        helpStr += '\n' + ('-DeleteLord - (hiveName, hivelordName)');
        helpStr += '\n' + ('-DeleteJob - (hiveName, hivelordName, jobID)');
        helpStr += '\n' + ('-SetCurrentJob - (hiveName, hivelordName, jobID)');
        helpStr += '\n' + ('-AddCommand - (commandType, target?)');
        helpStr += '\n' + ('-SetTarget - (hiveName, hivelordName, jobID, cmdID, targetID)');
        helpStr += '\n' + ('-InitJob - (repeatJob)');
        helpStr += '\n' + ('-SetJobBody - (bodyParts = {move: 2, work: 1, carry: 1})');
        console.log(helpStr);
        return OK;
    }
} global['CC'] = ConsoleCommands;