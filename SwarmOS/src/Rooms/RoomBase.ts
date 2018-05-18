import { ParentThreadProcess } from "Core/ThreadProcess";

export abstract class RoomBase<T extends RoomProcess_Memory> extends ParentThreadProcess<T> {
    @extensionInterface(EXT_RoomView)
    View!: IRoomDataExtension;

    protected get CreepGroups() { return this.memory.childThreads; }
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

        this.memory.tid = this.thread.EnsureThreadGroup(this.pid, this.threadID);
        this.prepHostThread(roomData, this.room);
    }
    protected EnsureCreepGroup(groupID: string, groupPackageID: string, makeNewMem: () => CreepGroup_Memory) {
        if (!this.CreepGroups[groupID]) {
            this.CreepGroups[groupID] = {
                priority: Priority_Medium,
                pid: ''
            }
        }
        if (!this.CreepGroups[groupID] || !this.kernel.getProcessByPID(this.CreepGroups[groupID].pid)) {
            this.CreepGroups[groupID] = {
                priority: Priority_Medium,
                pid: this.kernel.startProcess(groupPackageID, makeNewMem())
            };
        }
    }

    protected abstract prepHostThread(roomData: RVD_RoomMemory, room?: Room): void;
}