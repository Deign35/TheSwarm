import { RoomBase } from "./RoomBase";
export const OSPackage: IPackage<SpawnRegistry_Memory> = {
    install(processRegistry: IProcessRegistry, extensionRegistry: IExtensionRegistry) {
        processRegistry.register(PKG_SimpleOwnedRoom, BasicOwnedRoom);
    }
}

class BasicOwnedRoom extends RoomBase<RoomProcess_Memory> {
    //protected prepHostThread(roomData: RVD_RoomMemory, room?: Room | undefined): void {
    protected PrepareChildren(): void {
        let roomData = this.View.GetRoomData(this.memory.roomName);
        if (!roomData) {
            throw new Error(`Room data retrieval failure`);
        }
        // (TODO): Need to update the group if needs change, either from here or the group
        /*this.EnsureCreepGroup('Bui', CG_Builder, () => {
            return {
                tid: 'Bui' + GetSUID(),
                assignments: {},
                CT: CT_Builder,
                enabled: true,
                homeRoom: this.memory.roomName,
                lvl: 0,
                numReq: Math.ceil((roomData!.cSites.length / 4)) + 1,
                pri: Priority_Lowest,
                targetRoom: this.memory.roomName,
                childThreads: {},
                PKG: PKG_CreepBuilder
            }
        });
        this.EnsureCreepGroup('Harv', CG_Harvester, () => {
            return {
                tid: 'Harv' + GetSUID(),
                assignments: {},
                CT: CT_Harvester,
                enabled: true,
                homeRoom: this.memory.roomName,
                lvl: 0,
                numReq: roomData!.sourceIDs.length,
                pri: Priority_High,
                targetRoom: this.memory.roomName,
                sIDs: roomData!.sourceIDs,
                childThreads: {},
                PKG: PKG_CreepHarvester
            }
        });
        this.EnsureCreepGroup('Ref', CG_Refiller, () => {
            return {
                tid: 'Ref' + GetSUID(),
                assignments: {},
                CT: CT_Refiller,
                enabled: true,
                homeRoom: this.memory.roomName,
                lvl: 0,
                numReq: 1,
                pri: Priority_Highest,
                targetRoom: this.memory.roomName,
                childThreads: {},
                PKG: PKG_CreepRefiller
            }
        });

        this.EnsureCreepGroup('Upg', CG_Upgrader, () => {
            return {
                tid: 'Upg' + GetSUID(),
                assignments: {},
                CT: CT_Upgrader,
                enabled: true,
                homeRoom: this.memory.roomName,
                lvl: 0,
                numReq: 1,
                pri: Priority_Lowest,
                targetRoom: this.memory.roomName,
                childThreads: {},
                PKG: PKG_CreepUpgrader
            }
        });*/
    }
}