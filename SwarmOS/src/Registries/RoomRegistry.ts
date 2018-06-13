declare var Memory: {
    roomData: RoomStateMemory
}

import { ExtensionBase, BasicProcess } from "Core/BasicTypes";

export const OSPackage: IPackage<RoomStateMemory> = {
    install(processRegistry: IProcessRegistry, extensionRegistry: IExtensionRegistry) {
        processRegistry.register(PKG_RoomManager, RoomRegistry);
        extensionRegistry.register(EXT_RoomView, new RoomExtension(extensionRegistry));
    }
}

class RoomRegistry extends BasicProcess<RoomStateMemory> {
    get logID() { return 'RoomRegistry' };
    get logLevel() { return LOG_INFO as LogLevel; }
    @extensionInterface(EXT_RoomView)
    RoomView!: RoomExtension;
    get memory(): RoomStateMemory {
        if (!Memory.roomData) {
            this.log.warn(`Initializing RoomManager memory`);
            Memory.roomData = {
                roomStateData: {},
                cartographicMemory: {
                    creeps: {},
                    homeRooms: {}
                }
            }
        }
        return Memory.roomData;
    }
    RunThread(): ThreadState {
        for (let roomID in Game.rooms) {
            let data = this.RoomView.GetRoomData(roomID);
            if (!data || !data.activityPID || !this.kernel.getProcessByPID(data.activityPID)) {
                this.RoomView.BootRoom(roomID, false);
            }
        }

        return ThreadState_Done;
    }
}

class RoomExtension extends ExtensionBase implements IRoomDataExtension {
    get memory(): RoomStateMemory {
        if (!Memory.roomData) {
            this.log.warn(`Initializing RoomManager memory`);
            Memory.roomData = {
                roomStateData: {},
                cartographicMemory: {
                    creeps: {},
                    homeRooms: {}
                }
            }
        }

        return Memory.roomData;
    }

    GetRoomData(roomID: string): RoomState | undefined {
        return this.memory.roomStateData[roomID];
    }

    SetScoutNexus(roomID: RoomID) {
        if (!this.memory.cartographicMemory.homeRooms[roomID]) {
            this.memory.cartographicMemory.homeRooms[roomID] = { nearbyRooms: [] }
        }
    }

    BootRoom(roomID: string, force: boolean) {
        let data = this.GetRoomData(roomID);
        if (force || !data) {
            if (data && data.activityPID) {
                this.extensionRegistry.getKernel().killProcess(data.activityPID, 'Rebooting room');
                delete data.activityPID;
            }
            let room = Game.rooms[roomID];
            this.memory.roomStateData[roomID] = {
                owner: '',
                lastUpdated: 0,
                lastEnergy: 0,
                cSites: [],
                resources: [],
                tombstones: [],
                needsRepair: [],
                mineralIDs: room.find(FIND_MINERALS)!.map((val: Mineral) => {
                    return val.id;
                }),
                minUpdateOffset: GetRandomIndex(primes_3000) || 73,
                sourceIDs: room.find(FIND_SOURCES)!.map((val: Source) => {
                    return val.id;
                }),
                structures: {
                    container: [],
                    road: []
                },
                groups: {
                    CR_Work: '',
                    RJ_Misc: '',
                    RJ_Structures: '',
                    RJ_WorkTarget: ''
                },
                targets: {
                    CR_SpawnFill: {
                        energy: {},
                        targets: {}
                    },
                    CR_Work: {
                        energy: {},
                        targets: {}
                    },
                    Other: {
                        at: AT_NoOp,
                        t: TT_None,
                        en: 0,
                        target: ''
                    },
                    Fill: {
                        at: AT_NoOp,
                        t: TT_None,
                        c: 0,
                        target: ''
                    }
                },
                activityPID: '',
                RoomType: {
                    other: {
                        tr: roomID
                    },
                    type: RT_None
                }
            }
        }


        data = this.GetRoomData(roomID)!;
        if (!data.activityPID || !this.extensionRegistry.getKernel().getProcessByPID(data.activityPID)) {
            let newMem: RoomProvider_Memory = {
                rID: roomID
            }
            this.memory.roomStateData[roomID]!.activityPID = this.extensionRegistry.getKernel().startProcess(SPKG_RoomActivity, newMem);
        }

    }
}
