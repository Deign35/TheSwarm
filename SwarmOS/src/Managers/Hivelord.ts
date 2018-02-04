import { SwarmMemory } from "Memory/SwarmMemory";
import { JobBase } from "JobRoles/JobBase";
import { CommandMemory } from "Memory/CommandMemory";
import { HarvesterJob } from "JobRoles/HarvesterJob";
import { HL_REQUIRE_CREEP, SwarmReturnCode, HL_RETRY, HL_NEXT_COMMAND } from "SwarmEnums";

export class Hivelord extends SwarmMemory {
    TaskJobs: { [name: string]: JobBase };
    AddNewJob(job: JobBase) {
        this.TaskJobs[job.MemoryID] = job;
    }

    Activate(room: Room) {
        for (let name in this.TaskJobs) {
            this.TaskJobs[name].Activate(room);
        }
    }

    Save() {
        let _jobIDs = [];
        for (let name in this.TaskJobs) {
            this.TaskJobs[name].Save();
            _jobIDs.push(this.TaskJobs[name].MemoryID)
        }

        this.SetData('jobData', _jobIDs);
        super.Save();
    }

    Load() {
        super.Load();
        let TaskJobData = this.GetData('jobData') || [] as string[];
        this.TaskJobs = {};
        for (let i = 0, length = TaskJobData.length; i < length; i++) {
            this.TaskJobs[TaskJobData[i]] = new HarvesterJob(TaskJobData[i], this);
        }
    }
}