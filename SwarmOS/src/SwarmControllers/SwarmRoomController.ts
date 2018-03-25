
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

    private static _instance: SwarmRoomController;
    static GetSwarmObject(roomName: string): ISwarmRoom {
        return this._instance.GetSwarmObject(roomName) as ISwarmRoom;
    }
} global["SwarmQueen"] = SwarmRoomController;