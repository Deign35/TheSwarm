import { SwarmMemory } from "Memory/SwarmMemory";
import { HarvesterJob } from "JobRoles/HarvesterJob";
import { Hivelord } from "Managers/Hivelord";
import { SwarmReturnCode, HL_REQUIRE_CREEP } from "SwarmEnums";
import { RCL1_Hivelord } from "Managers/RCL1_Hivelord";

export class HiveQueen extends SwarmMemory { // Controls a group of HiveNodes.
    // Should change this to be an interface and different levels or configurations can have different kinds of HiveQueens
    // Each hive queen can have it's own objective.
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
            let hiveData = this.GetData(HiveLordData[i]);
            this.Hivelords[HiveLordData[i]] = new RCL1_Hivelord(HiveLordData[i], this);
        }
    }

    Activate() {
        for (let name in this.Hivelords) {
            this.Hivelords[name].Activate(Game.rooms[this.MemoryID]);
        }
    }

    InitHiveQueen() {
        let hive = Game.rooms[this.MemoryID];
        let sources = hive.find(FIND_SOURCES);
        // Should have one harvester per source, then RCL1_HLs until RCL2, then RCL2s
        let newHivelord = new RCL1_Hivelord('RCL1_HL', this);
        newHivelord.Save();
        this.Hivelords[newHivelord.MemoryID] = (newHivelord);
        // Be sure to save the hivelord data before trying to use it.
    }
}