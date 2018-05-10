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

    }

    protected abstract activateRoom(): void;
}