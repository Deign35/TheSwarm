import { Hivelord } from "Managers/Hivelord";
import { ConsoleCommands } from "Commands/ConsoleCommands"
import { BasicCreepCommandType } from "SwarmEnums";

export class GenericRoles {
    AllRoles = [] as any[]; // Create roles after getting body sizes implemented

    //Create
    CreatePrimeHarvesterJob(hiveName: string) {
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

    CreateBasicHarvesterJob(hiveName: string, bodyParts?: {[partName: string]: number}) {
        let newLordName = hiveName + ('' + Game.time).slice(-5);
        ConsoleCommands.AddLord(hiveName, newLordName)
        ConsoleCommands.AddJob(hiveName, newLordName, 'EZJob');
        ConsoleCommands.AddCommand(BasicCreepCommandType.C_Harvest);
        ConsoleCommands.AddCommand(BasicCreepCommandType.C_Transfer);
        ConsoleCommands.AddCommand(BasicCreepCommandType.C_Build);
        ConsoleCommands.AddCommand(BasicCreepCommandType.C_Upgrade);
        if(bodyParts) {
            ConsoleCommands.SetJobBody(bodyParts);
        }
        ConsoleCommands.InitJob(true);
        return OK;
    }

    CreateGenPurposeJob(hiveName: string, bodyParts?: {[partName: string]: number}) {
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

    CreateUpgraderJob(hiveName: string, bodyParts?: {[partName: string]: number}) {
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
}