import { NestQueen } from "./NestQueen";
import { RCL1_HiveQueen } from "./HiveQueen";
import { profile } from "Tools/Profiler";

@profile
export class SwarmQueen implements ISwarmQueen {
    private Queens!: { [roomName: string]: IQueen };
    private static _instance: SwarmQueen;
    static PrepareTheSwarm() {
        this._instance = new SwarmQueen();
        this._instance.PrepareTheSwarm();
    }
    PrepareTheSwarm() {
        this.Queens = {};
        for (const roomName in Swarmlord.GetMemoryEntries(StorageMemoryType.Room)) {
            if (!Game.rooms[roomName]) {
                // Room is no longer in view.  Need to figure out what this means.
            }
        }
        for (const roomName in Game.rooms) {
            this.Queens[roomName] = this.CreateSwarmObject(Game.rooms[roomName]);
            this.Queens[roomName].StartTick();
        }
    }
    static ActivateSwarm() { this._instance.ActivateSwarm() }
    ActivateSwarm() {
        for (let roomName in this.Queens) {
            this.Queens[roomName].ProcessTick();
        }
    }
    static FinalizeSwarmActivity() { this._instance.FinalizeSwarmActivity(); }
    FinalizeSwarmActivity() {
        for (let roomName in this.Queens) {
            this.Queens[roomName].EndTick();
        }
    }
    static CreateSwarmObject(room: Room): IQueen {
        return this._instance.CreateSwarmObject(room);
    }
    CreateSwarmObject(room: Room): IQueen {
        return new RCL1_HiveQueen(room);
    }
} global["SwarmQueen"] = SwarmQueen;