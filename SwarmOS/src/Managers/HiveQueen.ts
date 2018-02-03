import { SwarmMemory } from "Memory/SwarmMemory";
import * as _ from "lodash";
import { HarvesterJob } from "JobRoles/HarvesterJob";
import { Hivelord } from "Managers/Hivelord";

export class HiveQueen extends SwarmMemory { // Controls a group of HiveNodes.
    HiveLords: Hivelord[];
    //Tumors: {[name: string]: SwarmMemory} = {};
    Save() {
        for(let name in this.HiveLords) {
            this.HiveLords[name].Save();
        }
        /*for(let name in this.Tumors) {
            this.Tumors[name].Save();
        }*/
        super.Save();
    }
    Load() {
        super.Load();
        let HiveLordData = this.GetData('HiveLordData') || [] as string[];
        for(let i = 0, length = HiveLordData.length; i < length; i++) {
            this.HiveLords[HiveLordData[i]] = new Hivelord(HiveLordData[i], this);
        }
        /*let TumorData = this.GetData('TumorData') || [] as string[]; // No tumors yet
        for(let i = 0, length = TumorData.length; i < length; i++) {
            this.Tumors[TumorData[i]] = new SwarmMemory(TumorData[i], this);
        }*/
    }

    Activate() {
        for(let i = 0, length = this.HiveLords.length; i < length; i++) {
            this.HiveLords[i].Activate();
        }
    }

    InitHiveQueen() {
        let hive = Game.rooms[this.MemoryID];
        let sources = hive.find(FIND_SOURCES);
        let ids = [] as string[];
        if(sources.length > 0) {
            ids.push(sources[0].id);
            if(sources.length > 1) {
                ids.push(sources[1].id);
                // ASSUMPTION: Currently only 2 sources per room are allowed.
            }
        }
        this.SetData('Sources', ids);

        let mineral = hive.find(FIND_MINERALS);
        if (mineral) {
            this.SetData('Mineral', mineral[0].id);
        }
    }
}