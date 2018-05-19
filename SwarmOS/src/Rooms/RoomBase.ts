import { ParentThreadProcess } from "Core/AdvancedTypes";

export abstract class RoomBase<T extends RoomProcess_Memory> extends ParentThreadProcess<T> {
    @extensionInterface(EXT_RoomView)
    View!: IRoomDataExtension;

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
    }

    AttachNewCreepGroup(groupPackage: CreepGroupPackage, creepGroupMemory: CreepGroup_Memory) {
        if (!this.memory.groups[groupPackage]) {
            this.memory.groups[groupPackage] = '';
        }
        if (this.kernel.getProcessByPID(this.memory.groups[groupPackage]!)) {
            this.log.warn(`Attempted to add a creep group to a room that already has one.`);
            return;
        }
        let newPid = this.kernel.startProcess(groupPackage, creepGroupMemory);
        this.AttachChildThread(creepGroupMemory, this.pid, newPid);
    }
}