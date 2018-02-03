import { SwarmMemory } from "Memory/SwarmMemory";
import { HiveQueen } from "Managers/HiveQueen";

export class SwarmQueen extends SwarmMemory {
    HiveQueens: {[name: string]: HiveQueen} = {};

    Activate() {
        //Activate each job or request for resources.
        for(let name in this.HiveQueens) {
            this.HiveQueens[name].Activate();
        }
    }

    Save() {
        for(let name in this.HiveQueens) {
            this.HiveQueens[name].Save();
        }
        super.Save();
    }
    Load() {
        super.Load();
        let HiveQueenData = this.GetData('HiveQueenData') || [] as string[];
        for(let i = 0, length = HiveQueenData.length; i < length; i++) {
            this.HiveQueens[HiveQueenData[i]] = new HiveQueen(HiveQueenData[i]);
        }
    }

    static InitializeSwarm() {
        let newSwarm = new SwarmQueen('TheSwarm');
        newSwarm.Save();
        newSwarm.Load();
        for(let name in Game.rooms) {
            let room = Game.rooms[name];
            if(!room.controller || !room.controller.my) { continue; }

            newSwarm.HiveQueens[name] = new HiveQueen(name);
            newSwarm.HiveQueens[name].InitHiveQueen();
            newSwarm.HiveQueens[name].Save();
            newSwarm.HiveQueens[name].Load();
        }
        // Create a HiveQueen per controlled room.

        // Initialize each HiveQueen
        Swarmlord.SetData(newSwarm);
        return OK;
    }
}