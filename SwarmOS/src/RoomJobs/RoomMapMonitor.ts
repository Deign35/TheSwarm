export const OSPackage: IPackage<SpawnRegistry_Memory> = {
    install(processRegistry: IProcessRegistry, extensionRegistry: IExtensionRegistry) {
        processRegistry.register(RJ_Mapper, RoomMapMonitor);
    }
}

import { RoomMonitorBase } from "./RoomMonitors";

class RoomMapMonitor extends RoomMonitorBase<RoomMonitor_Memory> {
    InitMonitor() {
        if (!this.room) {
            throw new Error(`Attempted to initialize RoomMapMonitor(${this.memory.rID} without access to the room`);
        }
        let sources = this.room.find(FIND_SOURCES);
        for (let i = 0; i < sources.length; i++) {
            this.roomData.distanceMaps[sources[i].id] = DistMap.CreateDistanceMap(this.room, [sources[i].pos]);
        }

        let minerals = this.room.find(FIND_MINERALS);
        for (let i = 0; i < minerals.length; i++) {
            this.roomData.distanceMaps[minerals[i].id] = DistMap.CreateDistanceMap(this.room, [minerals[i].pos]);
        }

        this.roomData.distanceMaps[this.room.controller!.id] = DistMap.CreateDistanceMap(this.room, [this.room.controller!.pos]);
        this.mapper.GenerateRefillMap(this.room);
        this.mapper.GenerateSpawnEnergyMap(this.room);

        return true;
    }

    MonitorRoom(): ThreadState {
        if (!this.room) {
            return ThreadState_Done;
        }
        if (this.shouldRefresh(241)) {
            this.mapper.GenerateRefillMap(this.room);
        }
        if (this.shouldRefresh(473)) {
            this.mapper.GenerateSpawnEnergyMap(this.room);
        }

        this.memory.lu = Game.time;
        return ThreadState_Done;
    }
}