import { SwarmMemory } from "Memory/SwarmMemory";
import * as _ from "lodash"; // Compiler: IgnoreLine
import { JobBase } from "JobRoles/JobBase";
import { CommandMemory } from "Memory/CommandMemory";
import { HarvesterJob } from "JobRoles/HarvesterJob";
import { HL_REQUIRE_CREEP, SwarmReturnCode } from "SwarmEnums";

export class Hivelord extends SwarmMemory {
    protected TaskJobs: { [name: string]: JobBase };

    AddNewJob(job: JobBase) {
        this.TaskJobs[job.MemoryID] = job;
    }

    Activate(): SwarmReturnCode {
        // Activated until OK is returned;
        let result = ERR_INVALID_ARGS as SwarmReturnCode;
        for (let name in this.TaskJobs) {
            let job = this.TaskJobs[name];
            result = job.LastResult;
            if (result == OK) { continue; }
            result = job.ProcessJob();
            // Update the job based on the result.
            if (result == HL_REQUIRE_CREEP) {
                // Spawn a creep or find an available one.
                console.log('I need a creep');
            }

            job.LastResult = result;
        }

        return result;
    }

    Save() {
        for (let name in this.TaskJobs) {
            this.TaskJobs[name].Save();
        }
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