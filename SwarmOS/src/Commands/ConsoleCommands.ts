import { HiveQueen } from "Managers/HiveQueen";
import { CreepCommandType, BasicCreepCommandType } from "SwarmEnums";
import { Hivelord } from "Managers/Hivelord";
import { GenPurposeJob } from "JobRoles/GenPurposeJob";
import { SwarmMemory } from "Memory/SwarmMemory";
import { BasicCreepCommand } from "Commands/BasicCreepCommand";

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
    static GetHivelord(hive: HiveQueen, hivelordName: string) {
        if (!hive.Hivelords[hivelordName]) {
            throw 'Hivelord[' + hivelordName + '] does not exist.';
        }
        return hive.Hivelords[hivelordName];
    }
    static AddLord(hiveName: string, hivelordName: string) { // Failing because it does not use the same memory object
        // as the one already created by the hive.  Get the existing hivelord instead of new memory.
        // I believe this has something to do with the chain of Saving.  The saved hivelord on the object
        // doesn't have the same jobs list on it.  Ergo, memory can only be checked out once at a time.
        let hive = this.GetHive(hiveName);
        if (hive.Hivelords[hivelordName]) {
            throw 'Hivelord[' + hivelordName + '] already exists.';
        }
        hive.Hivelords[hivelordName] = new Hivelord(hivelordName, hive);
        hive.Save();
    }
    static DeleteHivelord(hive: HiveQueen, hivelordName: string) {
        if (!hive.Hivelords[hivelordName]) {
            console.log('Error, hivelord doesnt exist by that name');
            return;
        }
        hive.DeleteData(hivelordName);
        hive.Save();
    }
    static GetJob(hivelord: Hivelord, jobID: string) {
        return hivelord.Jobs[jobID];
    }
    static AddJob(hiveName: string, hivelordID: string, jobID: string) {
        let hive = this.GetHive(hiveName);
        let hivelord = this.GetHivelord(hive, hivelordID);
        let newJob = new GenPurposeJob(jobID, hivelord);
        hivelord.AddNewJob(newJob);
        hive.Save();
        this.SetQuickJob(hiveName, hivelordID, jobID);
    }
    static DeleteJob(hivelord: Hivelord, jobID: string) {
        if (!hivelord.JobMemory.GetData(jobID)) {
            console.log('Error, hivelord doesnt exist by that name');
            return;
        }
        hivelord.DeleteData(jobID);
        hivelord.Save();
    }

    static SetQuickJob(hiveName: string, hivelordID: string, jobID: string) {
        let mem = new SwarmMemory('ConsoleCommands');
        mem.SetData('hive', hiveName);
        mem.SetData('lord', hivelordID);
        mem.SetData('job', jobID);
        mem.Save();
    }

    static AddCommand(commandType: CreepCommandType, target?: string) {
        let mem = new SwarmMemory('ConsoleCommands');
        let hive = this.GetHive(mem.GetData('hive'));
        let job = hive.Hivelords[mem.GetData('lord')].Jobs[mem.GetData('job')] as GenPurposeJob;
        job.AddCommand(commandType, target);
        hive.Save();
    }

    static EZSetup() {
        this.AddLord('sim', 'Lord1');
        this.AddJob('sim', 'Lord1', 'Job1');
        this.AddCommand(BasicCreepCommandType.C_Harvest);
        this.AddCommand(BasicCreepCommandType.C_Upgrade);
        this.InitJob(false);
    }

    static InitJob(repeat: boolean) {
        let mem = new SwarmMemory('ConsoleCommands');
        let hive = this.GetHive(mem.GetData('hive'));
        let job = hive.Hivelords[mem.GetData('lord')].Jobs[mem.GetData('job')] as GenPurposeJob;
        job.InitJob(repeat)
        hive.Save();
    }

    static Help() {
        console.log('TheSwarmOS Console Commands -----');
        console.log('-Reset - Hard reset for the entire OS')
        console.log('-GetHive - (hiveName)');
        console.log('-GetHivelord - (hive, hivelordName)');
        console.log('-AddLord - (hive, hivelordName)');
        console.log('-DeleteHivelord - (hive, hivelordName)');
        console.log('-GetJob - (hivelord, jobID)\n---AddCommand - (commandType, target?)');
        console.log('-AddJob - (hiveName, hivelordName, jobID)');
        console.log('-DeleteJob - (hivelord, jobID)');
        console.log('-SetQuickJob - (hiveName, hivelordName, jobID)');
        console.log('-GetQJ - QuickJob');
        console.log('-AddCommand - (commandType, target?)');
        console.log('-EZSetup');
        return OK;
    }
} global['CC'] = ConsoleCommands;