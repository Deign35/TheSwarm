import { SwarmMemory } from "Memory/SwarmMemory";
import { HarvesterJob } from "JobRoles/HarvesterJob";
import { Hivelord } from "Managers/Hivelord";
import { SwarmReturnCode, HL_REQUIRE_CREEP } from "SwarmEnums";

export class HiveQueen extends SwarmMemory { // Controls a group of HiveNodes.
    Hivelords: { [name: string]: Hivelord };
    Save() {
        let _hivelordIDs = [];
        for (let name in this.Hivelords) {
            this.Hivelords[name].Save();
            _hivelordIDs.push(this.Hivelords[name].MemoryID);
        }

        this.SetData('HiveLordData', _hivelordIDs);
        super.Save();
    }

    Load() {
        super.Load();
        this.Hivelords = {};
        let HiveLordData = this.GetData('HiveLordData') || [] as string[];
        for (let i = 0, length = HiveLordData.length; i < length; i++) {
            this.Hivelords[HiveLordData[i]] = new Hivelord(HiveLordData[i], this);
        }
    }

    Activate() {
        for (let name in this.Hivelords) {
            let hiveLordResult;
            let retryCount = 0;
            do {
                hiveLordResult = this.Hivelords[name].Activate();
                if (hiveLordResult == HL_REQUIRE_CREEP) {
                    // Try to get this lord a creep
                }
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
            let newHarvesterJob = new HarvesterJob('S' + i, newHivelord);
            let spawner = sources[i].pos.findClosestByPath(FIND_MY_SPAWNS);
            if (!spawner) { throw 'No spawner found in room' }
            newHarvesterJob.InitJob(spawner, sources[i].id, true);
            newHivelord.AddNewJob(newHarvesterJob);
        }
        newHivelord.Save();
        this.Hivelords[newHivelord.MemoryID] = (newHivelord);

        // Be sure to save the hivelord data before trying to use it.
    }
}