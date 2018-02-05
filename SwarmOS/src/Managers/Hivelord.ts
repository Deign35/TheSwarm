import { SwarmMemory } from "Memory/SwarmMemory";
import { JobBase } from "JobRoles/JobBase";
import { CommandMemory } from "Memory/CommandMemory";
import { HL_REQUIRE_CREEP, SwarmReturnCode, HL_RETRY, HL_NEXT_COMMAND } from "SwarmEnums";
import { GenPurposeJob } from "JobRoles/GenPurposeJob";

export class Hivelord extends SwarmMemory {
    Jobs: { [name: string]: JobBase };
    JobMemory: SwarmMemory;
    AddNewJob(job: JobBase) {
        this.Jobs[job.MemoryID] = job;
    }

    Activate(room: Room) {
        for (let name in this.Jobs) {
            this.Jobs[name].Activate(room);
        }
    }

    Save() {
        let jobIDs = [];
        for (let name in this.Jobs) {
            this.Jobs[name].Save();
            jobIDs.push(name);
        }
        this.SetData('jobIDs', jobIDs);
        super.Save();
    }

    Load() {
        super.Load();
        this.Jobs = {};
        let jobData = this.GetData('jobIDs') || [] as string[];
        for (let i = 0, length = jobData.length; i < length; i++) {
            this.Jobs[jobData[i]] = new GenPurposeJob(jobData[i], this);
        }
    }
}