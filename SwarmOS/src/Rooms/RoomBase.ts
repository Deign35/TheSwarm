import { ProcessBase } from "Core/BasicTypes";
import { EXT_RoomView, EXT_RoomStructures } from "SwarmManagers/RoomManager";

export abstract class RoomBase<T extends RoomProcess_Memory> extends ProcessBase {
    @posisInterface(EXT_RoomView)
    View!: IRoomViewExtension;
    @posisInterface(EXT_RoomStructures)
    Structures!: IRoomStructuresExtension;

    protected get memory(): T {
        return super.memory;
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