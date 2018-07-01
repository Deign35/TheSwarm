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

    // PathableMap will have a rating of 0 to 1 of how pathable a position is
    // Use this to find the best neighbor to use.
    FindPathFrom(x: number, y: number, distMap: MapArray, pathableMap: MapArray) {
        let startPos = DistMap.ConvertXYToIndex(x, y);
        let curMax = distMap[startPos];
        if (curMax <= 0) {

        }
        let nextTile = { x, y, dist: curMax, index: startPos };
        let path: { x: number, y: number, dist: number, index: number }[] = [];
        do {
            if (!nextTile) {
                break;
            }
            path.push(nextTile);

            if (nextTile.dist <= 0) {
                break;
            }
            if (nextTile.dist < curMax) {
                curMax = nextTile.dist;
            }
            if (nextTile.dist > curMax) {
                this.log.alert(`ASSUMPTION VIOLATION: Currently MakeRoadFromPoint is assumed to never put larger values into the search array`);
                continue;
            }

            let neighbors = DistMap.GetNeighborNodes(nextTile.x, nextTile.y);
            let bestNeighbor = undefined;
            for (let i = 0; i < neighbors.length; i++) {
                let nextIndex = DistMap.ConvertXYToIndex(neighbors[i].x, neighbors[i].y);
                if (pathableMap[nextIndex] > 0 && distMap[nextIndex] < nextTile.dist) {
                    if (!bestNeighbor || pathableMap[nextIndex] > pathableMap[bestNeighbor.index]) {
                        bestNeighbor = { x: neighbors[i].x, y: neighbors[i].y, dist: distMap[nextIndex], index: nextIndex };
                    }
                }
            }
            if (!bestNeighbor) {
                return ERR_NO_PATH;
            }
        } while (true);

        return path;
    }
}
