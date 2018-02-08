import { SwarmMemory } from "Memory/SwarmMemory";
import { CommandMemory } from "Memory/CommandMemory";
import * as SwarmEnums from "SwarmEnums";
import { SwarmJob } from "Hivelords/SwarmJob";
import { BasicCreepCommand } from "Commands/BasicCreepCommand";
import { HiveQueen } from "Managers/HiveQueen";

const JOB_IDS = 'JI';
const QUEEN_NAME = 'QN';
export class Hivelord extends SwarmMemory {
    Jobs: { [name: string]: SwarmJob };
    Body: BodyPartConstant[];

    Save() {
        let jobIDs = [];
        for (let name in this.Jobs) {
            this.Jobs[name].Save();
            jobIDs.push(name);
        }
        this.SetData(JOB_IDS, jobIDs);
        super.Save();
    }

    Load() {
        super.Load();
        this.Jobs = {};
        let jobData = this.GetData(JOB_IDS) || [] as string[];
        for (let i = 0, length = jobData.length; i < length; i++) {
            this.Jobs[jobData[i]] = new SwarmJob(jobData[i], this);
        }
    }
    InitHivelord(job: SwarmJob, body: BodyPartConstant[]) {
        this.Jobs[job.MemoryID] = job;
        this.Body = body;
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
}