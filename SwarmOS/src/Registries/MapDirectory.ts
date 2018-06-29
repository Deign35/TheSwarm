declare var Memory: {
    mapDirectory: {
        [id: string]: IDictionary<string, MapArray>
    }
}
import { ExtensionBase } from "Core/BasicTypes";

export const OSPackage: IPackage<FlagExtensionsMemory> = {
    install(processRegistry: IProcessRegistry, extensionRegistry: IExtensionRegistry) {
        extensionRegistry.register(EXT_MapDirectory, new MapDirectory(extensionRegistry));
    }
}

class MapDirectory extends ExtensionBase implements IMapDirectory {
    get memory(): IDictionary<RoomID, IDictionary<MapLayers, MapArray>> {
        if (!Memory.mapDirectory) {
            this.log.warn(`Initializing MapDirectory memory`);
            Memory.mapDirectory = {}
        }
        return Memory.mapDirectory;
    }

    GenerateImpassableMap(room: Room): boolean {
        let impassableMap = new Array(ROOM_ARRAY_SIZE).fill(1);
        let structures = room.find(FIND_STRUCTURES);
        for (let i = 0; i < structures.length; i++) {
            if (structures[i].structureType == STRUCTURE_CONTAINER ||
                structures[i].structureType == STRUCTURE_PORTAL ||
                structures[i].structureType == STRUCTURE_RAMPART ||
                structures[i].structureType == STRUCTURE_ROAD) {
                continue;
            }
            impassableMap[structures[i].pos.y * 50 + structures[i].pos.x] = 0;
        }
        this.memory[room.name][ML_Impassable] = impassableMap;
        return true;
    }
    GenerateSpawnEnergyMap(room: Room): boolean {
        let spawnEnergyPositions = room.find(FIND_STRUCTURES, {
            filter: (struct) => {
                return struct.structureType == STRUCTURE_SPAWN ||
                    struct.structureType == STRUCTURE_EXTENSION;
            }
        }).map((struct) => {
            return struct.pos;
        })
        return this.CreateMapForRoom(room.name, ML_SpawnEnergy, spawnEnergyPositions);
    }
    GenerateRefillMap(room: Room): boolean {
        let containerPositions = room.find(FIND_STRUCTURES, {
            filter: (struct) => {
                return struct.structureType == STRUCTURE_CONTAINER ||
                    struct.structureType == STRUCTURE_STORAGE ||
                    struct.structureType == STRUCTURE_TERMINAL;
            }
        }).map((struct) => {
            return struct.pos
        });
        return this.CreateMapForRoom(room.name, ML_RefillEnergy, containerPositions);
    }
    CreateMapForRoom(roomID: RoomID, mapID: string, startPositions: RoomPosition[]): boolean {
        if (Game.rooms[roomID] !== undefined) {
            if (!this.memory[roomID]) {
                this.memory[roomID] = {}
            }
            this.memory[roomID][mapID] = DistMap.CreateDistanceMap(Game.rooms[roomID], startPositions);
            return true;
        }
        return false;
    }
    GetMap(roomID: RoomID, mapID: string): MapArray | undefined {
        if (!this.memory[roomID]) {
            return;
        }
        return this.memory[roomID][mapID];
    }
    GetMaps(roomID: RoomID): IDictionary<string, MapArray> | undefined {
        return this.memory[roomID];
    }
}
