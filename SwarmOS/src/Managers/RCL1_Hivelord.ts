import { SwarmMemory } from "Memory/SwarmMemory";
import { JobBase } from "JobRoles/JobBase";
import { CommandMemory } from "Memory/CommandMemory";
import { HarvesterJob } from "JobRoles/HarvesterJob";
import { HL_REQUIRE_CREEP, SwarmReturnCode, HL_RETRY, HL_NEXT_COMMAND } from "SwarmEnums";
import { Hivelord } from "Managers/Hivelord";
import { RCL1_Worker } from "JobRoles/RCL1_Worker";

export class RCL1_Hivelord extends Hivelord {
    AddNewJob(job: JobBase) {
        this.TaskJobs[job.MemoryID] = job;
    }

    Activate(room: Room) {
        let allOk = true;
        for(let name in this.TaskJobs) {
            if(this.TaskJobs[name].Activate(room) != OK) {
                allOk = false;
            }
        }
        if(allOk) {
            let newWorker = new RCL1_Worker(('' + Game.time).slice(-4), this);
            newWorker.InitJob();
            this.AddNewJob(newWorker);
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
            this.TaskJobs[TaskJobData[i]] = new RCL1_Worker(TaskJobData[i], this); // Hard coded!
        }
    }
}