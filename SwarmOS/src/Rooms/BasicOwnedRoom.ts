import { RoomBase } from "./RoomBase";
export const OSPackage: IPackage<SpawnRegistry_Memory> = {
    install(processRegistry: IProcessRegistry, extensionRegistry: IExtensionRegistry) {
        processRegistry.register(PKG_SimpleOwnedRoom, BasicOwnedRoom);
    }
}

class BasicOwnedRoom extends RoomBase<RoomProcess_Memory> {
    protected activateRoom(roomData: RVD_RoomMemory, room?: Room | undefined): void {
        this.EnsureCreepGroup('Bui', CG_Builder, () => {
            return {
                assignments: {},
                CT: CT_Builder,
                enabled: true,
                homeRoom: this.memory.roomName,
                lvl: 0,
                numReq: Math.ceil((roomData.cSites.length / 4)),
                pri: Priority_Lowest,
                targetRoom: this.memory.roomName,
            }
        });
        this.EnsureCreepGroup('Harv', CG_Harvester, () => {
            return {
                assignments: {},
                CT: CT_Harvester,
                enabled: true,
                homeRoom: this.memory.roomName,
                lvl: 0,
                numReq: roomData.sourceIDs.length,
                pri: Priority_High,
                targetRoom: this.memory.roomName,
                sIDs: roomData.sourceIDs
            }
        });
        this.EnsureCreepGroup('Ref', CG_Refiller, () => {
            return {
                assignments: {},
                CT: CT_Refiller,
                enabled: true,
                homeRoom: this.memory.roomName,
                lvl: 0,
                numReq: 1,
                pri: Priority_Highest,
                targetRoom: this.memory.roomName,
            }
        });

        this.EnsureCreepGroup('Upg', CG_Upgrader, () => {
            return {
                assignments: {},
                CT: CT_Upgrader,
                enabled: true,
                homeRoom: this.memory.roomName,
                lvl: 0,
                numReq: 1,
                pri: Priority_Lowest,
                targetRoom: this.memory.roomName,
            }
        });

        this.sleeper.sleep(5);
    }
}