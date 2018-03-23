
import { profile } from "Tools/Profiler";
import { SwarmController } from "./SwarmController";
import { SwarmRoom } from "SwarmTypes/SwarmRoom";

const ROOM_SAVE_PATH = ['rooms'];
@profile
export class SwarmRoomController extends SwarmController<SwarmControllerDataTypes.Rooms, SwarmRoom>
    implements ISwarmRoomController {
    protected InitNewObj(swarmObj: SwarmRoom): void {
        swarmObj.InitNewObject();
    }
    get ControllerType(): SwarmControllerDataTypes.Rooms { return SwarmControllerDataTypes.Rooms; }
    protected GetTypeOf(obj: Room): SwarmType.SwarmRoom {
        return SwarmType.SwarmRoom;
    }
    protected get _dataType(): SwarmControllerDataTypes.Rooms {
        return SwarmControllerDataTypes.Rooms;
    }
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
        swarmObj.PrepareTheSwarm();
    }
    protected OnActivateSwarm(swarmObj: SwarmRoom): void {
        swarmObj.ActivateSwarm();
    }
    protected OnFinalizeSwarm(swarmObj: SwarmRoom): void {
        swarmObj.FinalizeSwarmActivity();
    }
    private static _instance: SwarmRoomController;
    static GetSwarmObject(roomName: string): ISwarmRoom {
        return this._instance.GetSwarmObject(roomName) as ISwarmRoom;
    }
    static PrepareTheSwarm() {
        this._instance = new SwarmRoomController();
        this._instance.PrepareTheSwarm();
    }
    static ActivateSwarm() { this._instance.ActivateSwarm() }
    static FinalizeSwarmActivity() { this._instance.FinalizeSwarmActivity(); }
} global["SwarmQueen"] = SwarmRoomController;