import { SwarmMemory } from "Memory/SwarmMemory";
import { SwarmlingMemory } from "Memory/SwarmlingMemory";
import * as _ from "lodash"; // Compiler: IgnoreLine
import { JobBase } from "JobRoles/JobBase";

export class Hivelord extends SwarmMemory {
    SwarmlingMinds: {[name: string]: SwarmlingMemory};
    TaskJobs: {[name: string]: JobBase};

    Activate() {
        //Activate each job or request for resources.
    }

    Save() {
        for(let name in this.SwarmlingMinds) {
            this.SwarmlingMinds[name].Save();
        }
        for(let name in this.TaskJobs) {
            this.TaskJobs[name].Save();
        }
        super.Save();
    }
    Load() {
        super.Load();
        let SwarmlingMindData = this.GetData('mindData') || [] as string[];
        for(let i = 0, length = SwarmlingMindData.length; i < length; i++) {
            this.SwarmlingMinds[SwarmlingMindData[i]] = new SwarmlingMemory(SwarmlingMindData[i], this);
        }
        let TaskJobData = this.GetData('jobData') || [] as string[];
        for(let i = 0, length = TaskJobData.length; i < length; i++) {
            this.TaskJobs[TaskJobData[i]] = new JobBase(TaskJobData[i], this);
        }
    }
}