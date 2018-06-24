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
    get memory(): RoomStateMemory {
        if (!Memory.roomData) {
            this.log.warn(`Initializing RoomManager memory`);
            Memory.roomData = {
                roomStateData: {}
            }
        }
        return Memory.roomData;
    }

    RunThread(): ThreadState {
        for (let roomID in Game.rooms) {
            let data = this.roomView.GetRoomData(roomID);
            if (!data || !data.activityPID || !this.kernel.getProcessByPID(data.activityPID)) {
                this.roomView.BootRoom(roomID, false);
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
                roomStateData: {}
            }
        }

        return Memory.roomData;
    }

    GetRoomData(roomID: string): RoomState | undefined {
        return this.memory.roomStateData[roomID];
    }

    BootRoom(roomID: string, force: boolean) {
        let data = this.GetRoomData(roomID);
        if (force || !data) {
            if (data && data.activityPID) {
                this.kernel.killProcess(data.activityPID, 'Rebooting room');
                delete data.activityPID;
            }
            let room = Game.rooms[roomID];
            this.memory.roomStateData[roomID] = {
                owner: '',
                lastUpdated: 0,
                lastEnergy: 0,
                EnergyIncomeRate: 0,
                mineralIDs: room.find(FIND_MINERALS)!.map((val: Mineral) => {
                    return val.id;
                }),
                minUpdateOffset: GetRandomIndex(primes_3000) || 73,
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
                },
                exits: Game.map.describeExits(roomID),
                distanceMaps: {}
            }
        }

        data = this.GetRoomData(roomID)!;
        if (!data.activityPID || !this.kernel.getProcessByPID(data.activityPID)) {
            let newMem: RoomProvider_Memory = {
                rID: roomID,
                home: roomID
            }
            this.memory.roomStateData[roomID]!.activityPID = this.kernel.startProcess(SPKG_RoomActivity, newMem);
        }
    }

    //(TODO): Make this a new object that works more like processcontexts do.  Holds some extra functionality and cached between ticks
    CreateRoomStateObject(roomID: string) {
        let roomData = this.GetRoomData(roomID);
        if (!roomData) { return; }

        let roomContext = {
            data: roomData
        }
    }
}
