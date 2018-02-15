import { QueenMemory } from "Memory/SwarmMemory";
import { HiveQueen } from "Managers/HiveQueen";

export class SwarmQueen extends QueenMemory {
    HiveQueens!: { [name: string]: HiveQueen }

    Activate() {
        //Activate each job or request for resources.
        for (let name in this.HiveQueens) {
            //this.HiveQueens[name].Activate();
        }
    }

    Save() {
        let queenList = [];
        for (let name in this.HiveQueens) {
            this.HiveQueens[name].Save();
            queenList.push(name);
        }

        this.SetData('HiveQueenData', queenList);
        super.Save();
    }
    Load() {
        if (!super.Load()) { return false; }
        this.HiveQueens = {};
        let HiveQueenData = this.GetData('HiveQueenData') || [] as string[];
        for (let i = 0, length = HiveQueenData.length; i < length; i++) {
            this.HiveQueens[HiveQueenData[i]] = new HiveQueen(HiveQueenData[i]);
        }

        return true;
    }

    static LoadSwarmData(): SwarmQueen {
        return new SwarmQueen('SwarmQueen');
    }

    static InitializeSwarm() {
        let newSwarm = new SwarmQueen('SwarmQueen');
        newSwarm.Save();
        newSwarm.Load();
        for (let name in Game.rooms) {
            let room = Game.rooms[name];
            if (!room.controller || !room.controller.my) { continue; }

            newSwarm.HiveQueens[name] = new HiveQueen(name);
        }
        // Create a HiveQueen per controlled room.

        // Initialize each HiveQueen
        newSwarm.Save();
        return OK;
    }
}