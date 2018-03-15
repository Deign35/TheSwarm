import { NestQueen } from "./NestQueen";
import { RCL1_HiveQueen } from "./HiveQueen";
import { profile } from "Tools/Profiler";
import { SwarmManager } from "./SwarmManager";
import { SwarmRoom } from "SwarmObjects/SwarmRoom";
import { SwarmCreator } from "SwarmObjects/SwarmCreator";

@profile
export class SwarmQueen extends SwarmManager<StorageMemoryType.Room, SwarmRoom> implements ISwarmQueen {
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
            this.Queens[roomName] = new RCL1_HiveQueen(this.CreateSwarmObject(Game.rooms[roomName]));
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
    static CreateSwarmObject(room: Room): SwarmRoom {
        return this._instance.CreateSwarmObject(room);
    }
    protected CreateSwarmObject(room: Room): SwarmRoom {
        return SwarmCreator.CreateSwarmObject<Room, SwarmType.SwarmRoom>(room, SwarmType.SwarmRoom) as SwarmRoom;
    }
    protected getSwarmType(obj: any): SwarmType.SwarmRoom {
        return SwarmType.SwarmRoom;
    }
    protected findAllGameObjects(): { [id: string]: SwarmRoom; } {
        throw new Error("Method not implemented.");
    }
    protected getStorageType(): StorageMemoryType.Room {
        throw new Error("Method not implemented.");
    }
} global["SwarmQueen"] = SwarmQueen;