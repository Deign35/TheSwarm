import { Hivelord } from "Managers/Hivelord";
import { ConsoleCommands } from "./ConsoleCommands"
import { BasicCreepCommandType } from "SwarmEnums";

export class GenericRoles {
    static CreatePrimeHarvesterJob(hiveName: string) {
        let newLordName = hiveName + ('' + Game.time).slice(-5);
        ConsoleCommands.AddLord(hiveName, newLordName)
        ConsoleCommands.AddJob(hiveName, newLordName, 'EZJob');
        ConsoleCommands.AddCommand(BasicCreepCommandType.C_Harvest);
        ConsoleCommands.AddCommand(BasicCreepCommandType.C_Transfer);
        ConsoleCommands.AddCommand(BasicCreepCommandType.C_Build);
        ConsoleCommands.AddCommand(BasicCreepCommandType.C_Upgrade);
        ConsoleCommands.SetJobBody({work: 8, move: 6, carry: 4});
        ConsoleCommands.InitJob(true);
        return OK;
    }

    static CreateBasicHarvesterJob(hiveName: string, bodyParts: {[partName: string]: number} = {move: 2, carry: 1, work: 1}) {
        let newLordName = hiveName + ('' + Game.time).slice(-5);
        ConsoleCommands.AddLord(hiveName, newLordName)
        ConsoleCommands.AddJob(hiveName, newLordName, 'EZJob');
        ConsoleCommands.AddCommand(BasicCreepCommandType.C_Harvest);
        ConsoleCommands.AddCommand(BasicCreepCommandType.C_Transfer);
        ConsoleCommands.AddCommand(BasicCreepCommandType.C_Build);
        ConsoleCommands.AddCommand(BasicCreepCommandType.C_Upgrade);
        ConsoleCommands.SetJobBody(bodyParts);
        ConsoleCommands.InitJob(true);
        return OK;
    }

    static CreateGenPurposeJob(hiveName: string, bodyParts: {[partName: string]: number} = {move: 2, carry: 1, work: 1}) {
        let newLordName = hiveName + ('' + Game.time).slice(-5);
        ConsoleCommands.AddLord(hiveName, newLordName)
        ConsoleCommands.AddJob(hiveName, newLordName, 'EZJob');
        ConsoleCommands.AddCommand(BasicCreepCommandType.C_Pickup);
        ConsoleCommands.AddCommand(BasicCreepCommandType.C_Harvest);
        ConsoleCommands.AddCommand(BasicCreepCommandType.C_Build);
        ConsoleCommands.AddCommand(BasicCreepCommandType.C_Transfer);
        ConsoleCommands.AddCommand(BasicCreepCommandType.C_Repair);
        ConsoleCommands.AddCommand(BasicCreepCommandType.C_Upgrade);
        if(bodyParts) {
            ConsoleCommands.SetJobBody(bodyParts);
        }
        ConsoleCommands.InitJob(true);
        return OK;
    }

    static CreateUpgraderJob(hiveName: string, bodyParts?: {[partName: string]: number}) {
        let newLordName = hiveName + ('' + Game.time).slice(-5);
        ConsoleCommands.AddLord(hiveName, newLordName)
        ConsoleCommands.AddJob(hiveName, newLordName, 'EZJob');
        ConsoleCommands.AddCommand(BasicCreepCommandType.C_Pickup);
        ConsoleCommands.AddCommand(BasicCreepCommandType.C_Harvest);
        ConsoleCommands.AddCommand(BasicCreepCommandType.C_Upgrade);
        if(bodyParts) {
            ConsoleCommands.SetJobBody(bodyParts);
        }
        ConsoleCommands.InitJob(true);
        return OK;
    }

    static Help() {
        let helpStr = 'TheSwarmOS Console Commands -----';
        helpStr += '\n' + ('-CreatePrimeHarvesterJob')
        helpStr += '\n' + ('-CreateBasicHarvesterJob');
        helpStr += '\n' + ('-CreateGenPurposeJob');
        helpStr += '\n' + ('-CreateUpgraderJob');
        console.log(helpStr);
        return OK;
    }
}global['CCCreateJob'] = GenericRoles;