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

const CENTER = 0;
global['CENTER'] = 0;
const MapDirections = [
    TOP_LEFT,
    TOP,
    TOP_RIGHT,
    LEFT,
    RIGHT,
    BOTTOM_LEFT,
    BOTTOM,
    BOTTOM_RIGHT
];
const dirKeys = MapDirections.length;

class MapDirectory extends ExtensionBase implements IMapDirectory {
    get memory(): IDictionary<RoomID, IDictionary<MapLayers, MapArray>> {
        if (!Memory.mapDirectory) {
            this.log.warn(`Initializing MapDirectory memory`);
            Memory.mapDirectory = {}
        }
        return Memory.mapDirectory;
    }

    GenerateImpassableMap(room: Room): MapArray | undefined {
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
        return impassableMap;
    }
    GenerateSpawnEnergyMap(room: Room): MapArray | undefined {
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
    GenerateRefillMap(room: Room): MapArray | undefined {
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
    CreateMapForRoom(roomID: RoomID, mapID: string, startPositions: RoomPosition[]): MapArray | undefined {
        if (!Game.rooms[roomID]) {
            return;
        }
        return DistMap.CreateDistanceMap(Game.rooms[roomID], startPositions);
    }

    // PathableMap will have a rating of 0 to 1 of how pathable a position is
    // Use this to find the best neighbor to use.
    FindPathFrom(x: number, y: number, distMap: MapArray, pathableMap: MapArray, targetDist: number = 1) {
        if (targetDist <= 0) {
            targetDist = 1;
        }
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
            if (nextTile.dist <= targetDist) {
                break;
            }
            if (path.length > 200) {
                this.log.alert(`Path is too long...: ${JSON.stringify(path)}`);
                return ERR_NO_PATH;
            }
            if (nextTile.dist < curMax) {
                curMax = nextTile.dist;
            }

            let neighbors = neighborMapping[nextTile.index];
            let bestNeighbor = undefined;
            for (let i = 0; i < dirKeys; i++) {
                if (neighbors[MapDirections[i]]) {
                    let neighbor = neighbors[MapDirections[i]];
                    if (pathableMap[neighbor.index] > 0 && distMap[neighbor.index] < nextTile.dist) {
                        if (!bestNeighbor || pathableMap[neighbor.index] > pathableMap[bestNeighbor.index]) {
                            bestNeighbor = { x: neighbor.x, y: neighbor.y, dist: distMap[neighbor.index], index: neighbor.index };
                        }
                    }
                }
            }

            if (!bestNeighbor) {
                return ERR_NO_PATH;
            }
            nextTile = bestNeighbor;
        } while (true);

        return path;
    }
}
