import { BasicProcess } from "Core/BasicTypes";

export abstract class RoomGroup<T extends RoomGroup_Memory> extends BasicProcess<T> {
    @extensionInterface(EXT_CreepRegistry)
    protected creepRegistry!: ICreepRegistryExtensions;
    @extensionInterface(EXT_RoomView)
    protected View!: IRoomDataExtension;

    private _room?: Room;
    protected get room(): Room | undefined {
        return this._room;
    }
    protected get roomName(): RoomID {
        return this.memory.rID;
    }
    protected get roomData(): RoomState {
        return Memory.roomData.roomStateData[this.roomName];
    }

    PrepTick() {

    }

    RunThread(): ThreadState {

        return ThreadState_Done;
    }

    EndTick() {

    }
}