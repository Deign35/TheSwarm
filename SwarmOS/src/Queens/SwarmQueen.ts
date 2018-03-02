import { QueenMemory } from "Tools/SwarmMemory";
import { HiveQueen } from "Queens/HiveQueen";
import { HiveQueenBase } from "./HiveQueenBase";

const CREEP_COUNTER = 'CreepCounter';
export class SwarmQueen extends QueenMemory {
    HiveQueens!: { [name: string]: HiveQueenBase }

    Activate() {
        for (let name in this.HiveQueens) {
            this.HiveQueens[name].ActivateNest();
        }
    }

    Save() {
        let queenList = [];
        for (let name in this.HiveQueens) {
            this.HiveQueens[name].Save();
            queenList.push(name);
        }

        this.SetData('HiveQueenData', queenList);
        this.SetData(CREEP_COUNTER, global[CREEP_COUNTER]);
        super.Save();
    }
    Load() {
        if (!super.Load()) { return false; }
        this.HiveQueens = {};
        let HiveQueenData = this.GetData('HiveQueenData') || [] as string[];
        for (let i = 0, length = HiveQueenData.length; i < length; i++) {
            this.HiveQueens[HiveQueenData[i]] = new HiveQueen(HiveQueenData[i]);
        }

        global[CREEP_COUNTER] = this.GetData(CREEP_COUNTER);
        return true;
    }

    static LoadSwarmData(): SwarmQueen { // Why is this even here?
        return new SwarmQueen('SwarmQueen');
    }

    static InitializeSwarm() {
        // If the swarm has already been initialized and is still in memory, this will be a noop
        // due to how _SwarmMemory works.
        // The only effect this could have is adding rooms that you didn't previously add.
        // In that sense, it is safe to call, but explicitly adding the room would be better perf-wise.
        let newSwarm = new SwarmQueen('SwarmQueen');
        global[CREEP_COUNTER] = 0;
        newSwarm.Save();
        newSwarm.Load();
        for (let name in Game.rooms) {
            let room = Game.rooms[name];
            if (!room.controller || !room.controller.my) { continue; }

            newSwarm.HiveQueens[name] = new HiveQueen(name);
        }

        // Initialize each HiveQueen
        newSwarm.Save();
    }
}