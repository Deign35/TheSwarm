import { ParentThreadProcess } from "Core/AdvancedTypes";

export abstract class RoomBase<T extends RoomProcess_Memory> extends ParentThreadProcess<T> {
    @extensionInterface(EXT_RoomView)
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
    }

    /*protected EnsureCreepGroup(groupID: string, groupPackageID: string, makeNewMem: () => CreepGroup_Memory) {
        if (!this.CreepGroups[groupID]) {
            this.CreepGroups[groupID] = {
                priority: Priority_Medium,
                pid: '',
                tid: groupID
            }
        }
        if (!this.CreepGroups[groupID] || !this.kernel.getProcessByPID(this.CreepGroups[groupID].pid)) {
            this.CreepGroups[groupID] = {
                priority: Priority_Medium,
                pid: this.kernel.startProcess(groupPackageID, makeNewMem()),
                tid: groupID
            };
        }
    }*/
}