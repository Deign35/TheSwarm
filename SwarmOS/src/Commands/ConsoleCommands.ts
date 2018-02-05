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
    static AddLord(hiveName: string, hivelordName: string) {
        let hive = this.GetHive(hiveName);
        if (hive.Hivelords[hivelordName]) {
            throw 'Hivelord[' + hivelordName + '] already exists.';
        }
        hive.Hivelords[hivelordName] = new Hivelord(hivelordName, hive);
        hive.Save();
        return OK;
    }
    static DeleteLord(hiveName: string, hivelordName: string) {
        let hive = this.GetHive(hiveName);
        if(!hive.Hivelords[hivelordName]) {//.Jobs[mem.GetData('job')] as GenPurposeJob;
            throw 'Hivelord[' + hivelordName + '] does not exist.';
        }
        hive.DeleteData(hivelordName);
        delete hive.Hivelords[hivelordName];
        hive.Save();
        return OK;
    }
    static AddJob(hiveName: string, hivelordID: string, jobID: string) {
        let hive = this.GetHive(hiveName);
        let hivelord = hive.Hivelords[hivelordID];
        let newJob = new GenPurposeJob(jobID, hivelord);
        hivelord.AddNewJob(newJob);
        hive.Save();
        this.SetCurrentJob(hiveName, hivelordID, jobID);
        return OK;
    }
    static DeleteJob(hiveName: string, hivelordName: string, jobID: string) {
        let hive = this.GetHive(hiveName);
        if(!hive.Hivelords[hivelordName]) {
            throw 'Hivelord[' + hivelordName + '] does not exist.';
        }
        if(!hive.Hivelords[hivelordName].Jobs[jobID]) {
            throw 'Job[' + jobID + '] does not exist.';
        }
        hive.Hivelords[hivelordName].DeleteData(jobID);
        delete hive.Hivelords[hivelordName].Jobs[jobID];
        hive.Save();
        return OK;
    }

    static SetCurrentJob(hiveName: string, hivelordID: string, jobID: string) {
        let mem = new SwarmMemory('ConsoleCommands');
        mem.SetData('hive', hiveName);
        mem.SetData('lord', hivelordID);
        mem.SetData('job', jobID);
        mem.Save();
        return OK;
    }

    static AddCommand(commandType: CreepCommandType, target?: string) {
        let mem = new SwarmMemory('ConsoleCommands');
        let hive = this.GetHive(mem.GetData('hive'));
        let job = hive.Hivelords[mem.GetData('lord')].Jobs[mem.GetData('job')] as GenPurposeJob;
        job.AddCommand(commandType, target);
        hive.Save();
        return OK;
    }

    /*static EZJob(hiveName: string, bodyType: {[part:  string]: number} = {move: 2, carry: 1, work: 1}) {
        let newLordName = hiveName + ('' + Game.time).slice(-5);
        this.AddLord(hiveName, newLordName)
        this.AddJob(hiveName, newLordName, 'EZJob');
        this.AddCommand(BasicCreepCommandType.C_Pickup);
        this.AddCommand(BasicCreepCommandType.C_Harvest);
        this.AddCommand(BasicCreepCommandType.C_Build);
        this.AddCommand(BasicCreepCommandType.C_Transfer);
        this.AddCommand(BasicCreepCommandType.C_Repair);
        this.AddCommand(BasicCreepCommandType.C_Upgrade);
        this.SetJobBody(bodyType);
        this.InitJob(true);
        return OK;
    }*/

    static SetTarget(cmdID: string, target: string) {
        let mem = new SwarmMemory('ConsoleCommands');
        let hive = this.GetHive(mem.GetData('hive'));
        let job = hive.Hivelords[mem.GetData('lord')].Jobs[mem.GetData('job')] as GenPurposeJob;
        job.TargetData.SetData(cmdID, target);
        hive.Save();
    }

    static InitJob(repeat: boolean) {
        let mem = new SwarmMemory('ConsoleCommands');
        let hive = this.GetHive(mem.GetData('hive'));
        let job = hive.Hivelords[mem.GetData('lord')].Jobs[mem.GetData('job')] as GenPurposeJob;
        job.InitJob(repeat)
        hive.Save();
        return OK;
    }

    static SetJobBody(bodyParts: {[partType: string]: number }) {
        let mem = new SwarmMemory('ConsoleCommands');
        let hive = this.GetHive(mem.GetData('hive'));
        let job = hive.Hivelords[mem.GetData('lord')].Jobs[mem.GetData('job')] as GenPurposeJob;
        job.SetSpawnBody(bodyParts);
        hive.Save();
    }

    static EZStart(hiveName: string) {
        let sources = Game.rooms[hiveName].find(FIND_SOURCES);
        for(let i = 0; i < sources.length; i++) {
            GR.CreateBasicHarvesterJob(hiveName);
            this.SetTarget('#0', sources[i].id);
        }
        GR.CreateUpgraderJob(hiveName)
        GR.CreateGenPurposeJob(hiveName)
        GR.CreateGenPurposeJob(hiveName)
        GR.CreateGenPurposeJob(hiveName)
        GR.CreateGenPurposeJob(hiveName)
        GR.CreateGenPurposeJob(hiveName)
        return OK;
    }

    static EZUpdate(hiveName: string, bodyParts: {[partType: string]: number}) {
        let hive = this.GetHive(hiveName);
        for(let name in hive.Hivelords) { // Delete existing jobs.
            hive.DeleteData(name);
            delete hive.Hivelords[name];
        }
        for(let name in Memory.creeps) {
            Memory.creeps[name].Assigned = false;
        }
        Memory.TargetData = {};
        Memory['lordCount'] = 0;
        hive.Save();
        hive = this.GetHive(hiveName);
        let primeAvailable = Game.rooms[hiveName].energyCapacityAvailable > 1300;
        let sources = Game.rooms[hiveName].find(FIND_SOURCES);
        for(let i = 0; i < sources.length; i++) {
            if(primeAvailable) {
                GR.CreatePrimeHarvesterJob(hiveName, bodyParts)
            } else {
                GR.CreateBasicHarvesterJob(hiveName, bodyParts)
            }
            this.SetTarget('#0', sources[i].id);
        }
        GR.CreateUpgraderJob(hiveName)
        GR.CreateGenPurposeJob(hiveName, bodyParts)
        GR.CreateGenPurposeJob(hiveName, bodyParts)
        GR.CreateGenPurposeJob(hiveName, bodyParts)
        GR.CreateGenPurposeJob(hiveName, bodyParts)
        GR.CreateGenPurposeJob(hiveName, bodyParts)
        return OK;
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