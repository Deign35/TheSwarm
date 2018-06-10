export const OSPackage: IPackage<RoomStateMemory> = {
    install(processRegistry: IProcessRegistry, extensionRegistry: IExtensionRegistry) {
        processRegistry.register(PKG_SimpleOwnedRoom, BasicRoom);
    }
}

import { BasicProcess } from "Core/BasicTypes";

class BasicRoom extends BasicProcess<BasicRoom_Memory> {
    @extensionInterface(EXT_CreepRegistry)
    protected creepRegistry!: ICreepRegistryExtensions;
    @extensionInterface(EXT_RoomView)
    protected View!: IRoomDataExtension;
    protected roomData!: RoomState;
    get roomName() {
        return this.memory.homeRoom;
    }
    get room() {
        return Game.rooms[this.roomName];
    }
    PrepTick() {
        this.roomData = this.View.GetRoomData(this.roomName)!;
    }
    RunThread(): ThreadState {
        if (!this.roomData.groups.CJ_Harvest) {
            this.roomData.groups.CJ_Harvest = [];
        }
        if (this.roomData.groups.CJ_Harvest.length < this.roomData.sourceIDs.length) {
            if (this.roomData.groups.CJ_Harvest.length > 0) {
                this.log.alert(`ASSUMPTION FAILURE -- BasicRoom.EnsureGroupFormation()`);
            }
            for (let i = 0; i < this.roomData.sourceIDs.length; i++) {
                let newMem: HarvestJob_Memory = {
                    t: this.roomData.sourceIDs[i],
                    rID: this.memory.targetRoom
                }
                this.roomData.groups.CJ_Harvest.push(this.kernel.startProcess(CJ_Harvest, newMem));
            }
        }

        return ThreadState_Done;
    }
}