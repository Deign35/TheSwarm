import { NestQueen } from "./NestQueen";
import { RCL1_HiveQueen } from "./HiveQueen";

export class SwarmQueen {
    private constructor() { }
    static PrepareTheQueen() {
        this.Queens = {};
        let newQueen = new SwarmQueen();
        for (const roomName in Game.rooms) {
            this.Queens[roomName] = CreateQueen(Game.rooms[roomName]);
            this.Queens[roomName].StartTick();
        }
    }
    static ActivateSwarm() {
        for (let roomName in this.Queens) {
            this.Queens[roomName].ProcessTick();
        }
    }
    static FinalizeSwarmActivity() {
        for (let roomName in this.Queens) {
            this.Queens[roomName].EndTick();
        }
    }
    private static Queens: { [roomName: string]: IQueen };
}

function CreateQueen(room: Room): IQueen {
    return new RCL1_HiveQueen(room);
}