import { HiveQueen } from "Managers/HiveQueen";
import { CreepCommandType } from "SwarmEnums";
import { Hivelord } from "Managers/Hivelord";
import { GenPurposeJob } from "JobRoles/GenPurposeJob";

export class ConsoleCommands {
    static Reset() {
        Memory.INIT = false;
    }
    static GetHive(hiveName: string) {
        let queen = new HiveQueen(hiveName);
        if (!queen.GetData('HiveLordData')) {
            throw 'Hive[' + hiveName + '] does not exist.'
        }
        return queen;
    }
    static GetHivelord(hiveName: string, hivelordName: string) {
        let queen = this.GetHive(hiveName);
        if (!queen.Hivelords[hivelordName]) {
            throw 'Hivelord[' + hivelordName + '] does not exist.';
        }
        return new Hivelord(hivelordName, queen);
    }
    static CreateNewHivelord(hiveName: string, hivelordName: string) {
        let queen = this.GetHive(hiveName);
        if (queen.Hivelords[hivelordName]) {
            throw 'Hivelord[' + hivelordName + '] already exists.';
        }
        queen.Hivelords[hivelordName] = new Hivelord(hivelordName, queen);
        queen.Save();
    }
    static DeleteHivelord(hiveName: string, hivelordName: string) {
        let queen = this.GetHive(hiveName);
        if (!queen.Hivelords[hivelordName]) {
            console.log('Error, hivelord doesnt exist by that name');
            return;
        }
        queen.DeleteData(hivelordName);
        queen.Save();
    }
    static GetJob(hiveName: string, hivelordName: string, jobID: string) {
        let hivelord = this.GetHivelord(hiveName, hivelordName);
        if (!hivelord.TaskJobs[jobID]) {
            throw 'Job[' + jobID + '] does not exist';
        }
        return new GenPurposeJob(jobID, hivelord);
    }
    static CreateNewJob(hiveName: string, hivelordName: string, jobID: string) {
        let targetLord = this.GetHivelord(hiveName, hivelordName);
        targetLord.AddNewJob(new GenPurposeJob(jobID, targetLord));
        targetLord.Save();
    }
    static DeleteJob(hiveName: string, hivelordName: string, jobID: string) {
        let hivelord = this.GetHivelord(hiveName, hivelordName);
        if (!hivelord.TaskJobs[jobID]) {
            console.log('Error, hivelord doesnt exist by that name');
            return;
        }
        hivelord.DeleteData(jobID);
        hivelord.Save();
    }

    static Help() {
        console.log('TheSwarmOS Console Commandes -----');
        console.log('-Reset - Hard reset for the entire OS')
        console.log('-GetHive - (roomName)');
        console.log('-GetHivelord - (roomName, hivelordName)');
        console.log('-CreateNewHivelord - (roomName, hivelordName)');
        console.log('-DeleteHivelord - (roomName, hivelordName)');
        console.log('-GetJob - (roomName, hivelordName, jobID)\n---AddCommand - (commandType, target?)');
        console.log('-CreateNewJob - (hiveName, hivelordName, jobID)');
        console.log('-DeleteJob - (roomName, hivelordName, jobID)');
        return OK;
    }
} global['CC'] = ConsoleCommands;