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
        if (!this.roomData.groups.CG_SimpleSource) {
            this.roomData.groups.CG_SimpleSource = [];
        }
        if (this.roomData.groups.CG_SimpleSource.length < this.roomData.sourceIDs.length) {
            if (this.roomData.groups.CG_SimpleSource.length > 0) {
                this.log.alert(`ASSUMPTION FAILURE -- BasicRoom.EnsureGroupFormation()`);
            }
            for (let i = 0; i < this.roomData.sourceIDs.length; i++) {
                let newMem: HarvestJob_Memory = {
                    t: this.roomData.sourceIDs[i],
                    r: this.memory.targetRoom
                }
                this.roomData.groups.CG_SimpleSource.push(this.kernel.startProcess(CJ_Harvester, newMem));
            }
        }
        return ThreadState_Done;
    }
}