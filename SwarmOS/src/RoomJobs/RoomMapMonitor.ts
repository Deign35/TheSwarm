export const OSPackage: IPackage<SpawnRegistry_Memory> = {
    install(processRegistry: IProcessRegistry, extensionRegistry: IExtensionRegistry) {
        processRegistry.register(SPKG_RoomMapMonitor, RoomMapMonitor);
    }
}

import { RoomMonitorBase } from "./RoomMonitors";

const SPAWN_ENERGY_LAYER = 'energy';
const REFILL_ENERGY_LAYER = 'refill';
const IMPASSABLE_LAYER = 'imp';

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
        this.GenerateContainerMap();
        this.GenerateSpawnEnergyMap();
        this.GenerateImpassableMap();

        return true;
    }

    GenerateImpassableMap() {
        let impassableMap = new Array(ROOM_ARRAY_SIZE).fill(1);
        let structures = this.room!.find(FIND_STRUCTURES);
        for (let i = 0; i < structures.length; i++) {
            if (structures[i].structureType == STRUCTURE_CONTAINER ||
                structures[i].structureType == STRUCTURE_PORTAL ||
                structures[i].structureType == STRUCTURE_RAMPART ||
                structures[i].structureType == STRUCTURE_ROAD) {
                continue;
            }
            impassableMap[structures[i].pos.y * ROOM_WIDTH + structures[i].pos.x] = 0;
        }

        // (TODO): Should add that wall terrain also equal 0.
        this.roomData.distanceMaps[IMPASSABLE_LAYER] = impassableMap;
    }

    GenerateSpawnEnergyMap() {
        let spawnEnergyPositions = this.room!.find(FIND_STRUCTURES, {
            filter: (struct) => {
                return struct.structureType == STRUCTURE_SPAWN ||
                    struct.structureType == STRUCTURE_EXTENSION;
            }
        }).map((struct) => {
            return struct.pos;
        })
        this.roomData.distanceMaps[SPAWN_ENERGY_LAYER] = DistMap.CreateDistanceMap(this.room!, spawnEnergyPositions);
    }
    GenerateContainerMap() {
        let containerPositions = this.room!.find(FIND_STRUCTURES, {
            filter: (struct) => {
                return struct.structureType == STRUCTURE_CONTAINER ||
                    struct.structureType == STRUCTURE_STORAGE ||
                    struct.structureType == STRUCTURE_TERMINAL;
            }
        }).map((struct) => {
            return struct.pos
        });
        this.roomData.distanceMaps[REFILL_ENERGY_LAYER] = DistMap.CreateDistanceMap(this.room!, containerPositions);
    }

    MonitorRoom(): ThreadState {
        if (this.shouldRefresh(241)) {
            this.GenerateContainerMap();
        }
        if (this.shouldRefresh(473)) {
            this.GenerateSpawnEnergyMap();
        }

        this.memory.lu = Game.time;
        return ThreadState_Done;
    }
}