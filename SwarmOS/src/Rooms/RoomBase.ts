import { ProcessBase } from "Core/BasicTypes";

export abstract class RoomBase<T extends RoomProcess_Memory> extends ProcessBase {
    OnLoad() { }
    @posisInterface(EXT_RoomView)
    View!: IRoomDataExtension;

    protected get memory(): T {
        return super.memory;
    }

    get room(): Room | undefined {
        return Game.rooms[this.memory.roomName]
    }

    GetRoomView() {
        return this.View.GetRoomData(this.memory.roomName);
    }

    protected executeProcess(): void {
        let roomData = this.GetRoomView();
        if (!roomData) {
            this.log.error(`Room view data missing ${this.memory.roomName}`);
            this.kernel.killProcess(this.pid);
            return;
        }
        let room = Game.rooms[this.memory.roomName];
        // Check what type of room this is and convert as needed
        this.activateRoom(roomData, room);
    }

    protected abstract activateRoom(roomData: RoomData_Memory, room?: Room): void;
}