import { SwarmMemory } from "Memory/SwarmMemory";
import { CommandWeb } from "Memory/CommandWeb";
import { CommandMemory } from "Memory/CommandMemory";
import { BasicCreepCommand } from "Commands/BasicCreepCommand";

export class JobBase extends SwarmMemory implements IJob {
    JobCommands: CommandWeb;
    JobArgs: CommandMemory;

    Save() {
        this.JobCommands.Save();
        this.JobArgs.Save();
        super.Save();
    }

    Load() {
        super.Load();
        this.JobCommands = new CommandWeb('jobCommands', this);
        this.JobArgs = new CommandMemory('jobArgs', this);
    }

    ProcessJob(JobMemory: CommandMemory) {
        if (!JobMemory.CreepName) {
            return ERR_INVALID_ARGS;
        }
        let JobID = JobMemory.CurCommandID;
        if (!JobMemory.CommandArgs) {
            // Construct the arguments from the job.
        }
        let JobArgs = JobMemory.CommandArgs;
        let creep = Game.creeps[JobMemory.CreepName];

        let commandResult = BasicCreepCommand.ExecuteCreepCommand(this.JobCommands.GetCommandType(JobID), creep, JobArgs);

        // Process the commandResult against the CommandWeb.
        return OK;
    }
}