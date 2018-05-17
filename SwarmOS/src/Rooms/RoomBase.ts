import { BasicProcess } from "Core/BasicTypes";

export abstract class RoomBase<T extends RoomProcess_Memory> extends BasicProcess<T> {
    @extensionInterface(EXT_RoomView)
    View!: IRoomDataExtension;

    protected get CreepGroups() { return this.memory.groups; }
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
    protected EnsureCreepGroup(groupID: string, groupPackageID: string, makeNewMem: () => CreepGroup_Memory) {
        if (!this.CreepGroups[groupID] || !this.kernel.getProcessByPID(this.CreepGroups[groupID])) {
            let newPID = this.kernel.startProcess(groupPackageID, makeNewMem());
            if (!newPID || !newPID.pid || !newPID.process) {
                this.log.error(`Room failed to create a harvester group (${this.memory.roomName})`);
            } else {
                this.CreepGroups[groupID] = newPID.pid;
            }
        }
    }

    protected abstract activateRoom(roomData: RVD_RoomMemory, room?: Room): void;
}