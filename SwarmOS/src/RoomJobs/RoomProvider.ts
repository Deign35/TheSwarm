export const OSPackage: IPackage<RoomStateMemory> = {
    install(processRegistry: IProcessRegistry, extensionRegistry: IExtensionRegistry) {
        processRegistry.register(SPKG_RoomActivity, RoomProvider);
    }
}

import { PackageProviderBase, BasicProcess } from "Core/BasicTypes";

class RoomProvider extends BasicProcess<RoomProvider_Memory> {
    EnsureRoomJobs() {
        let room = Game.rooms[this.memory.rID];
        let roomData = this.roomView.GetRoomData(this.memory.rID)!;
        if (!roomData) {
            this.kernel.killProcess(this.pid, `RoomProvider couldn't find any data`);
            return;
        }

        if (!roomData.groups.RJ_Misc || !this.kernel.getProcessByPID(roomData.groups.RJ_Misc)) {
            let newMem: RoomStateMisc_Memory = {
                hr: this.memory.home,
                lr: 0,
                lu: 0,
                rID: this.memory.rID
            }
            roomData.groups.RJ_Misc = this.kernel.startProcess(RJ_Misc, newMem);
        }
        if (!roomData.groups.RJ_WorkTarget || !this.kernel.getProcessByPID(roomData.groups.RJ_WorkTarget)) {
            let newMem: RoomStateWorkTarget_Memory = {
                hr: this.memory.home,
                lu: 0,
                rID: this.memory.rID,
                cSites: [],
                needsRepair: []
            }
            roomData.groups.RJ_WorkTarget = this.kernel.startProcess(RJ_WorkTarget, newMem);
        }

        if (!roomData.groups.RJ_Structures || !this.kernel.getProcessByPID(roomData.groups.RJ_Structures)) {
            let newMem: RoomMonitor_Memory = {
                rID: this.memory.rID,
                hr: this.memory.home,
                lu: 0,
                nb: true
            }
            roomData.groups.RJ_Structures = this.kernel.startProcess(RJ_Structures, newMem);
        }

        if (roomData.RoomType.type == RT_Home) {
            if (!roomData.groups.RJ_Tower || !this.kernel.getProcessByPID(roomData.groups.RJ_Tower)) {
                if (room.controller!.level >= 3 && room.find(FIND_STRUCTURES, {
                    filter: (struct) => {
                        return struct.structureType == STRUCTURE_TOWER;
                    }
                }).length > 0) {
                    let newMem: Tower_Memory = {
                        rID: this.memory.rID
                    }
                    roomData.groups.RJ_Tower = this.kernel.startProcess(RJ_Tower, newMem);
                }
            }
            if (!roomData.groups.RJ_Mapper || !this.kernel.getProcessByPID(roomData.groups.RJ_Mapper)) {
                let newMem: RoomMapMonitor_Memory = {
                    rID: this.memory.rID,
                    lu: 0,
                    nb: true,
                    luEN: 0,
                    luRE: 0,
                    luRO: 0,
                    luIM: 0,
                    hr: this.memory.home
                }
                roomData.groups.RJ_Mapper = this.kernel.startProcess(RJ_Mapper, newMem);
            }
            /*if (!roomData.groups.RJ_RoadGenerator || !this.kernel.getProcessByPID(roomData.groups.RJ_RoadGenerator)) {
                let newMem: RoomRoadGenerator_Memory = {
                    rID: this.memory.rID,
                    hr: this.memory.home,
                    nb: true,
                    lu: 0,
                    stage: 0,
                    fr: 1
                }
                roomData.groups.RJ_RoadGenerator = this.kernel.startProcess(RJ_RoadGenerator, newMem);
            }*/
        }

        if (roomData.RoomType.type == RT_Home || roomData.RoomType.type != RT_RemoteHarvest) {
            if (!roomData.groups.RJ_Harvest || !this.kernel.getProcessByPID(roomData.groups.RJ_Harvest)) {
                let newMem: RoomStateHarvest_Memory = {
                    hr: this.memory.home,
                    lu: 0,
                    rID: this.memory.rID,
                    harvesters: {},
                    nb: true
                }
                roomData.groups.RJ_Harvest = this.kernel.startProcess(RJ_Harvest, newMem);
            }
        }
    }
    RunThread(): ThreadState {
        this.EnsureRoomJobs();
        this.sleeper.sleep(this.pid, 8);
        return ThreadState_Done;
    }
}