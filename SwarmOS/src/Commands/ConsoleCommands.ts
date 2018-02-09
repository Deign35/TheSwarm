import { SwarmQueen } from "Managers/SwarmQueen";
import { SwarmJob } from "Hivelords/SwarmJob";
import { SwarmJobCreator } from "Commands/GenericRoles";

export class ConsoleCommands {
    static Reset() {
        Memory.INIT = false;
    }
    static CreateHarvester(body: BodyPartConstant[], target?: string) {
        let swarmQueen = SwarmQueen.LoadSwarmData();
        let hiveQueen = swarmQueen.HiveQueens['E9N35'];
        SwarmJobCreator.CreateHarvester(hiveQueen, body, target);
        swarmQueen.Save();
    }

    static CreateUpgrade(body: BodyPartConstant[]) {
        let swarmQueen = SwarmQueen.LoadSwarmData();
        let hiveQueen = swarmQueen.HiveQueens['E9N35'];
        SwarmJobCreator.CreateJob(hiveQueen, ['Ha', 'Up'], body);
        swarmQueen.Save();
    }

    static CreateJob(actions: string[], body: BodyPartConstant[]) {
        let swarmQueen = SwarmQueen.LoadSwarmData();
        let hiveQueen = swarmQueen.HiveQueens['E9N35'];
        SwarmJobCreator.CreateJob(hiveQueen, actions, body);
        swarmQueen.Save();
    }

    static UpgradeBodies(body: BodyPartConstant[]) {
        let swarmQueen = SwarmQueen.LoadSwarmData();
        let hiveQueen = swarmQueen.HiveQueens['E9N35'];
        for (let index in hiveQueen.Jobs) {
            hiveQueen.Jobs[index].BodyDefinition = body;
        }
        swarmQueen.Save();
    }
    static Help() {
        let helpStr = 'TheSwarmOS Console Commands -----';
        helpStr += '\n' + ('-CreateJob - (actions: string[], bodypartConstant[])')
        helpStr += '\n' + ('-UpgradeBodies - (bodypartConstant[])');
        console.log(helpStr);
        return OK;
    }
} global['CC'] = ConsoleCommands;
global['help'] = CC.Help();