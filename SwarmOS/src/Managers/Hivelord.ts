import { SwarmMemory } from "Memory/SwarmMemory";
import * as _ from "lodash"; // Compiler: IgnoreLine
import { JobBase } from "JobRoles/JobBase";
import { CommandMemory } from "Memory/CommandMemory";

export class Hivelord extends SwarmMemory {
    protected CommandData: { [name: string]: SwarmMemory };
    protected TaskJobs: { [name: string]: JobBase };

    Activate() {
        //Activate each job or request for resources.
        for (let name in this.TaskJobs) {
            let job = this.TaskJobs[name];
            if (!this.CommandData[job.MemoryID]) {
                // Need to initialize the "program"
                this.CommandData[job.MemoryID] = new CommandMemory(job.MemoryID, this);
            }

            let commandData = this.CommandData[job.MemoryID] as CommandMemory;
            let validationResult = commandData.Validate();

        }
    }

    Save() {
        for (let name in this.CommandData) {
            this.CommandData[name].Save();
        }
        for (let name in this.TaskJobs) {
            this.TaskJobs[name].Save();
        }
        super.Save();
    }
    Load() {
        super.Load();
        let SwarmlingMindData = this.GetData('mindData') || [] as string[];
        for (let i = 0, length = SwarmlingMindData.length; i < length; i++) {
            this.CommandData[SwarmlingMindData[i]] = new SwarmMemory(SwarmlingMindData[i], this);
        }
        let TaskJobData = this.GetData('jobData') || [] as string[];
        for (let i = 0, length = TaskJobData.length; i < length; i++) {
            this.TaskJobs[TaskJobData[i]] = new JobBase(TaskJobData[i], this);
        }
    }
}