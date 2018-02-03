import { SwarmMemory } from "Memory/SwarmMemory";
import * as _ from "lodash"; // Compiler: IgnoreLine
import { JobBase } from "JobRoles/JobBase";

export class Hivelord extends SwarmMemory {
    SwarmlingMinds: {[name: string]: SwarmMemory};
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
            this.SwarmlingMinds[SwarmlingMindData[i]] = new SwarmMemory(SwarmlingMindData[i], this);
        }
        let TaskJobData = this.GetData('jobData') || [] as string[];
        for(let i = 0, length = TaskJobData.length; i < length; i++) {
            this.TaskJobs[TaskJobData[i]] = new JobBase(TaskJobData[i], this);
        }
    }
}