
import { profile } from "Tools/Profiler";
import { SwarmManager } from "./SwarmManager";
import { SwarmRoom } from "SwarmTypes/SwarmRoom";

const ROOM_SAVE_PATH = ['rooms'];
@profile
export class SwarmQueen extends SwarmManager<SwarmType.SwarmRoom, Room, SwarmDataType.Room> implements ISwarmRoomController {
    protected getManagerSavePath(): string[] {
        return ROOM_SAVE_PATH;
    }
    protected getSwarmType(obj: Room): SwarmType.SwarmRoom {
        return SwarmType.SwarmRoom
    }
    protected getStorageType(): SwarmDataType.Room {
        return SwarmDataType.Room;
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
    static GetSwarmObject(roomName: string): ISwarmRoom {
        return this._instance.GetSwarmObject(roomName) as ISwarmRoom;
    }
    static PrepareTheSwarm() {
        this._instance = new SwarmQueen();
        this._instance.PrepareTheSwarm();
    }
    static ActivateSwarm() { this._instance.ActivateSwarm() }
    static FinalizeSwarmActivity() { this._instance.FinalizeSwarmActivity(); }
} global["SwarmQueen"] = SwarmQueen;