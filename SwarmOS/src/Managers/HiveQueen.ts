import { SwarmMemory } from "Memory/SwarmMemory";
import * as _ from "lodash";
import { HarvesterJob } from "JobRoles/HarvesterJob";
import { Hivelord } from "Managers/Hivelord";
import { SwarmReturnCode } from "SwarmEnums";

export class HiveQueen extends SwarmMemory { // Controls a group of HiveNodes.
    Hivelords: Hivelord[];
    Save() {
        let _hivelordIDs = [];
        for (let name in this.Hivelords) {
            this.Hivelords[name].Save();
            _hivelordIDs.push(name);
        }

        this.SetData('HiveLordData', _hivelordIDs);
        super.Save();
    }
    Load() {
        super.Load();
        this.Hivelords = [];
        let HiveLordData = this.GetData('HiveLordData') || [] as string[];
        for (let i = 0, length = HiveLordData.length; i < length; i++) {
            this.Hivelords[HiveLordData[i]] = new Hivelord(HiveLordData[i], this);
        }
    }

    Activate() {
        for (let i = 0, length = this.Hivelords.length; i < length; i++) {
            let hiveLordResult;
            let retryCount = 0;
            do {
                hiveLordResult = this.Hivelords[i].Activate();
            } while (hiveLordResult != OK && retryCount++ < 10);

            if (hiveLordResult != OK) {
                throw 'HIVELORD HAS FAILED: ' + hiveLordResult;
            }
        }
    }

    InitHiveQueen() {
        let hive = Game.rooms[this.MemoryID];
        let sources = hive.find(FIND_SOURCES);
        // Create jobs
        let newHivelord = new Hivelord('HL_S', this);
        for (let i = 0, length = sources.length; i < length; i++) {
            let newHarvesterJob = new HarvesterJob('' + i, newHivelord);
            newHarvesterJob.InitJob(sources[i].id, true);
            newHivelord.AddNewJob(newHarvesterJob);
        }
        newHivelord.Save();
        this.Hivelords.push(newHivelord);

        // Be sure to save the hivelord data before trying to use it.
    }
}