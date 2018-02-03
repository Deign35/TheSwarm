import { SwarmMemory } from "Memory/SwarmMemory";
import { BasicCreepCommand } from "Commands/BasicCreepCommand";
import { CommandWeb } from "Commands/ComplexCommand";
import { Swarmling } from "SwarmTypes/Swarmling";

export class JobBase extends SwarmMemory implements IJob {
    JobCommands: CommandWeb;
    JobArgs: IMemory;

    Save() {
        this.JobCommands.Save();
        this.JobArgs.Save();
        super.Save();
    }

    Load() {
        super.Load();
        this.JobCommands = new CommandWeb('jobCommands', this);
        this.JobArgs = new SwarmMemory('jobArgs', this);
    }

    ProcessJob(creep: Swarmling) {
        let creepData = creep.Brain;
        let JobData = creepData.GetData('JobData');
        let curCmd = JobData['cmd'] as BasicCreepCommandType;
    }
}