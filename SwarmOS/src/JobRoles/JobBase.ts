import { SwarmMemory } from "Memory/SwarmMemory";
import { CommandWeb } from "Memory/CommandWeb";

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

    ProcessJob(JobMemory: IMemory) {
        let JobData = JobMemory.GetData('JobData');
        let curCmd = JobData['cmd'] as BasicCreepCommandType;

        // Execute command here.
        return OK;
    }
}