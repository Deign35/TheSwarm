
import { profile } from "Tools/Profiler";
import { SwarmManager } from "./SwarmManager";
import { SwarmRoom } from "SwarmObjects/SwarmRoom";
import { SwarmCreator } from "SwarmObjects/SwarmCreator";
import { RCL1_HiveQueen } from "Queens/HiveQueen";

const ROOM_SAVE_PATH = ['rooms'];
@profile
export class SwarmQueen extends SwarmManager<StorageMemoryType.Room, SwarmRoom> implements ISwarmQueen {
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
    static PrepareTheSwarm() {
        this._instance = new SwarmQueen();
        this._instance.PrepareTheSwarm();
    }
    static ActivateSwarm() { this._instance.ActivateSwarm() }
    static FinalizeSwarmActivity() { this._instance.FinalizeSwarmActivity(); }
} global["SwarmQueen"] = SwarmQueen;