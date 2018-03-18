
import { profile } from "Tools/Profiler";
import { SwarmManager } from "./SwarmManager";
import { SwarmRoom } from "SwarmItems/SwarmRoom";

const ROOM_SAVE_PATH = ['rooms'];
@profile
export class SwarmQueen extends SwarmManager<SwarmRoom> implements ISwarmQueen {
    protected getManagerSavePath(): string[] {
        return ROOM_SAVE_PATH;
    }
    protected getSwarmType(obj: Room): SwarmType.SwarmRoom {
        return SwarmType.SwarmRoom
    }
    protected getStorageType(): StorageMemoryType.Room {
        return StorageMemoryType.Room;
    }
    protected FindAllGameObjects(): { [id: string]: Room; } {
        return Game.rooms;
    }
    protected OnPrepareSwarm(swarmObj: SwarmRoom): void {
    }
    protected OnActivateSwarm(swarmObj: SwarmRoom): void {
    }
    protected OnFinalizeSwarm(swarmObj: SwarmRoom): void {
    }
    private static _instance: SwarmQueen;
    static GetSwarmObject(roomName: string): TSwarmRoom {
        return this._instance.GetSwarmObject(roomName);
    }
    static PrepareTheSwarm() {
        this._instance = new SwarmQueen();
        this._instance.PrepareTheSwarm();
    }
    static ActivateSwarm() { this._instance.ActivateSwarm() }
    static FinalizeSwarmActivity() { this._instance.FinalizeSwarmActivity(); }
} global["SwarmQueen"] = SwarmQueen;