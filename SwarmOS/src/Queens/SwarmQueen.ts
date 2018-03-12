import { NestQueen } from "./NestQueen";
import { RCL1_HiveQueen } from "./HiveQueen";

export class SwarmQueen implements ISwarmQueen {
    private constructor() { }
    static InitSwarmQueen() {
        let newQueen = new SwarmQueen();
        for (const roomName in Game.rooms) {
            CreateQueen(Game.rooms[roomName]);
        }
    }
    private Queens!: { [roomId: string]: IQueen };
}

function CreateQueen(room: Room): IQueen {
    return new RCL1_HiveQueen(room);
}