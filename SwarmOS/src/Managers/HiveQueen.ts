import { SwarmMemory } from "Memory/SwarmMemory";
import { Hivelord } from "Managers/Hivelord";
import { SwarmReturnCode, HL_REQUIRE_CREEP } from "SwarmEnums";

const HIVELORD_DATA = 'HD';
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

        this.SetData(HIVELORD_DATA, _hivelordIDs);
        super.Save();
    }

    Load() {
        super.Load();
        this.Hivelords = {};
        let HiveLordData = this.GetData(HIVELORD_DATA) || [] as string[];
        for (let i = 0, length = HiveLordData.length; i < length; i++) {
            //let hiveData = this.GetData(HiveLordData[i]);
            this.Hivelords[HiveLordData[i]] = new Hivelord(HiveLordData[i], this);
        }
    }

    Activate() {
        for (let name in this.Hivelords) {
            this.Hivelords[name].ProcessHivelord();
        }
    }

    AddNewHivelord(hivelord: Hivelord) {
        hivelord.QueenName = this.MemoryID;
        this.Hivelords[hivelord.MemoryID] = hivelord;
    }

    InitHiveQueen() {
        /*let hive = Game.rooms[this.MemoryID];
        let sources = hive.find(FIND_SOURCES);
        // Should have one harvester per source, then RCL1_HLs until RCL2, then RCL2s
        let newHivelord = new RCL1_Hivelord('RCL1_HL', this);
        newHivelord.Save();
        this.Hivelords[newHivelord.MemoryID] = (newHivelord);
        // Be sure to save the hivelord data before trying to use it.


    let room = Game.rooms['W2N5'];
    if(room.energyCapacityAvailable >= 1300 && !Memory['Triggered']) {
        Memory['Triggered'] = true;
        CC.EZUpdate('W2N5', {work:8, carry:4, move:6});
    }
    if(room.energyCapacityAvailable >= 2000 && !Memory['Triggered2']) {
        Memory['Triggered2'] = true;
        CC.EZUpdate('W2N5', {work:5, carry:2, move:3});
        GR.CreateGenPurposeJob('W2N5', {work:10, carry:6, move:8});
        GR.CreateGenPurposeJob('W2N5', {work:5, carry:3, move:4});
        GR.CreateGenPurposeJob('W2N5', {work:5, carry:3, move:4});
    }
    if(room.controller.progress < 100) {
        if(Memory['CurRCL'] != room.controller.level && !Memory['Triggered']) {
            if(room.controller.level == 3) {
                CC.EZUpdate('W2N5', {move:2, carry:1, work:3})
            } else if(room.controller.level == 4) {
                CC.EZUpdate('W2N5', {move:4, carry:2, work:4})
            }

            Memory['CurRCL'] = room.controller.level;
        }
        let flags = room.find(FIND_FLAGS);
        for(let i = 0; i < flags.length; i++) {
            room.createConstructionSite(flags[i].pos, STRUCTURE_EXTENSION);
            flags[i].remove();
        }
    }
        */
    }
}