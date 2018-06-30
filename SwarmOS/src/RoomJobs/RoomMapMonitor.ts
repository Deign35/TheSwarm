export const OSPackage: IPackage<SpawnRegistry_Memory> = {
    install(processRegistry: IProcessRegistry, extensionRegistry: IExtensionRegistry) {
        processRegistry.register(RJ_Mapper, RoomMapMonitor);
    }
}

import { RoomMonitorBase } from "./RoomMonitors";

class RoomMapMonitor extends RoomMonitorBase<RoomMapMonitor_Memory> {
    protected get refreshFrequency() {
        return 1;
    }
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

        if (this.shouldRefresh(241, this.memory.luRE)) {
            this.mapper.GenerateRefillMap(this.room);
            this.memory.luRE = Game.time;
        }

        if (this.shouldRefresh(397, this.memory.luIM)) {
            this.mapper.GenerateImpassableMap(this.room);
            this.memory.luIM = Game.time;
        }
        
        if (this.shouldRefresh(473, this.memory.luEN)) {
            this.mapper.GenerateSpawnEnergyMap(this.room);
            this.memory.luEN = Game.time;
        }

        this.memory.lu = Game.time;
        return ThreadState_Done;
    }
}