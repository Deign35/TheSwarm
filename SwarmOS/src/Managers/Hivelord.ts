import { SwarmMemory } from "Memory/SwarmMemory";
import { CommandMemory } from "Memory/CommandMemory";
import * as SwarmEnums from "SwarmEnums";
import { SwarmJob } from "Hivelords/SwarmJob";
import { BasicCreepCommand } from "Commands/BasicCreepCommand";

export class Hivelord extends SwarmMemory {
    Jobs: { [name: string]: SwarmJob };
    AddNewJob(job: SwarmJob) {
        this.Jobs[job.MemoryID] = job;
    }

    Activate(room: Room) {
        for (let name in this.Jobs) {
            this.Jobs[name].Activate();
        }
    }

    ProcessHivelord() {
        for (let index in this.Jobs) {
            let result = this.Jobs[index].ValidateJob();
            if (result != OK) {
                // respond and fix the problems.  Like spawning
            }

            if (result == OK) {
                result = this.Jobs[index].Activate();
                if (result != OK) {
                    console.log('Failed action: ' + JSON.stringify(this));
                }
            }
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
            this.Jobs[jobData[i]] = new SwarmJob(jobData[i], this);
        }
    }
}