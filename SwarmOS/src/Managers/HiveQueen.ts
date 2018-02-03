import { SwarmMemory } from "Memory/SwarmMemory";
import * as _ from "lodash";
import { HarvesterJob } from "JobRoles/HarvesterJob";
import { Hivelord } from "Managers/Hivelord";

export class HiveQueen extends SwarmMemory { // Controls a group of HiveNodes.
    HiveLords: Hivelord[];
    Save() {
        for (let name in this.HiveLords) {
            this.HiveLords[name].Save();
        }
        super.Save();
    }
    Load() {
        super.Load();
        this.HiveLords = [];
        let HiveLordData = this.GetData('HiveLordData') || [] as string[];
        for (let i = 0, length = HiveLordData.length; i < length; i++) {
            this.HiveLords[HiveLordData[i]] = new Hivelord(HiveLordData[i], this);
        }
    }

    Activate() {
        for (let i = 0, length = this.HiveLords.length; i < length; i++) {
            this.HiveLords[i].Activate();
        }
    }

    InitHiveQueen() {
        let hive = Game.rooms[this.MemoryID];
        let sources = hive.find(FIND_SOURCES);
        // Create jobs
        let newHiveLord = new Hivelord('HL_S', this);
        for (let i = 0, length = sources.length; i < length; i++) {
            let newHarvesterJob = new HarvesterJob('S' + i, newHiveLord);
            newHarvesterJob.InitJob(sources[i].id, true);
            newHiveLord.AddNewJob(newHarvesterJob);
        }
        this.HiveLords.push(newHiveLord);

        // Be sure to save the hivelord data before trying to use it.
    }
}