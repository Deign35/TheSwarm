import { HiveQueen } from "Managers/HiveQueen";
import { RCL1_Hivelord } from "Managers/RCL1_Hivelord";

export class ConsoleCommands {
    static CreateNewHivelord(queenName: string, hivelordName: string) {
        let queen = new HiveQueen(queenName);
        if (!queen.GetData('HiveLordData')) {
            console.log('Error, room does not exist');
            return;
        }

        if (queen.Hivelords[hivelordName]) {
            console.log('Error, hivelord already exists by that name');
            return;
        }
        queen.Hivelords[hivelordName] = new RCL1_Hivelord(hivelordName, queen);
        queen.Save();
    }
    static DeleteHivelord(queenName: string, hivelordName: string) {
        let queen = new HiveQueen(queenName);
        if (!queen.GetData('HiveLordData')) {
            console.log('Error, room does not exist');
            return;
        }

        if (!queen.Hivelords[hivelordName]) {
            console.log('Error, hivelord doesnt exist by that name');
            return;
        }
        delete queen.Hivelords[hivelordName];
        queen.Save();
    }
} global['ConsoleCommands'] = ConsoleCommands;