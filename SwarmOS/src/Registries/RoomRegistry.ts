declare var Memory: {
    roomData: RoomStateMemory
}

import { ExtensionBase, SlimProcess } from "Core/BasicTypes";

export const OSPackage: IPackage<RoomStateMemory> = {
    install(processRegistry: IProcessRegistry, extensionRegistry: IExtensionRegistry) {
        processRegistry.register(PKG_RoomManager, RoomRegistry);
        extensionRegistry.register(EXT_RoomView, new RoomExtension(extensionRegistry));
    }
}

class RoomRegistry extends SlimProcess<RoomStateMemory> {
    get logID() { return 'RoomRegistry' };
    get logLevel() { return LOG_INFO as LogLevel; }
    @extensionInterface(EXT_RoomView)
    RoomView!: RoomExtension;
    protected get memory(): RoomStateMemory {
        if (!Memory.roomData) {
            Memory.roomData = {
                roomStateData: {}
            }
        }
        return Memory.roomData;
    }
    RunThread(): ThreadState {
        for (let roomID in Game.rooms) {
            let data = this.RoomView.GetRoomData(roomID);
            if (!data || !data.activityPID || !this.kernel.getProcessByPID(data.activityPID)) {
                let newMem: RoomActivity_Memory = {
                    rID: roomID
                }
                if (!data) {
                    let room = Game.rooms[roomID];
                    Memory.roomData.roomStateData[roomID] = {
                        owner: '',
                        lastUpdated: 0,
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
                        groups: {},
                        activityPID: ''
                    }
                }
                this.memory.roomStateData[roomID]!.activityPID = this.kernel.startProcess(SPKG_RoomActivity, newMem);
            }
        }

        return ThreadState_Done;
    }
}

class RoomExtension extends ExtensionBase implements IRoomDataExtension {
    protected get memory(): IDictionary<RoomID, RoomState> {
        if (!Memory.roomData) {
            this.log.warn(`Initializing RoomManager memory`);
            Memory.roomData = {
                roomStateData: {}
            }
        }
        return Memory.roomData.roomStateData;
    }

    GetRoomData(roomID: string): RoomState | undefined {
        return this.memory[roomID];
    }
}