import { SwarmMemory } from "Memory/SwarmMemory";
import * as SwarmEnums from "SwarmEnums";

const RCL_VAL = 'RV';
export class HiveQueen extends SwarmMemory {
    Hive: Room;
    RCL: number;
    Overseers: IOverseer;
    Save() {
        this.SetData(RCL_VAL, this.RCL);
        super.Save();
    }

    Load() {
        super.Load();
        this.Hive = Game.rooms[this.MemoryID];
        this.RCL = this.GetData(RCL_VAL) || 0;
    }

    Activate() {

    }
}