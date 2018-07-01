global['ROOM_HEIGHT'] = 50;
global['ROOM_WIDTH'] = 50;
global['ROOM_ARRAY_SIZE'] = ROOM_HEIGHT * ROOM_WIDTH;

// MaxDistance of 99 so max of 2 digits.  For saving mem space, change to 999 for 3 digit max distance
const MAX_MAP_DIST = 99;
const START_TOKEN = -1;
export class DistMap {
    static ConvertXYToIndex(x: number, y: number) {
        return y * ROOM_WIDTH + x;
    }
    static ConvertIndexToXY(index: number) {
        return {
            x: index % ROOM_WIDTH,
            y: Math.floor(index / ROOM_WIDTH)
        }
    }
    static AddToMap(addVal: number, map: MapArray) {
        for (let i = 0; i < ROOM_ARRAY_SIZE; i++) {
            map[i] += addVal;
        }
    }
    static MultiplyMap(mulitplyVal: number, map: MapArray) {
        for (let i = 0; i < ROOM_ARRAY_SIZE; i++) {
            map[i] *= mulitplyVal;
        }
    }
    static ReverseMap(map: MapArray) {
        for (let i = 0; i < ROOM_ARRAY_SIZE; i++) {
            if (map[i] > 0) {
                map[i] = MAX_MAP_DIST - map[i];
            }
        }
    }
    static ExtractStartPositions(map: MapArray): { x: number, y: number }[] {
        let arr: { x: number, y: number }[] = [];
        for (let i = 0; i < ROOM_ARRAY_SIZE; i++) {
            if (map[i] == START_TOKEN) {
                arr.push(this.ConvertIndexToXY(i));
            }
        }

        return arr;
    }
    static AddDistanceMaps(mapsToAdd: MapArray[]) {
        let arr = new Array(ROOM_ARRAY_SIZE).fill(0);
        let idLength = mapsToAdd.length;
        for (let i = 0; i < ROOM_ARRAY_SIZE; i++) {
            let total = 0;
            for (let j = 0; j < idLength; j++) {
                total += mapsToAdd[j][i];
            }
            arr[i] = total;
        }

        return arr;
    }
    static MaxDistanceMaps(mapsToAdd: MapArray[]) {
        let arr = new Array(ROOM_ARRAY_SIZE).fill(0);
        let idLength = mapsToAdd.length;
        for (let i = 0; i < ROOM_ARRAY_SIZE; i++) {
            let maxVal = 0;
            for (let j = 0; j < idLength; j++) {
                if (mapsToAdd[j][i] > maxVal) {
                    maxVal = mapsToAdd[j][i];
                }
            }
            arr[i] = maxVal;
        }

        return arr;
    }
    static MinDistanceMaps(mapsToAdd: MapArray[]) {
        let arr = new Array(ROOM_ARRAY_SIZE).fill(0);
        let idLength = mapsToAdd.length;
        for (let i = 0; i < ROOM_ARRAY_SIZE; i++) {
            let minVal = 1000;
            for (let j = 0; j < idLength; j++) {
                if (mapsToAdd[j][i] < minVal) {
                    minVal = mapsToAdd[j][i];
                }
            }
            arr[i] = minVal;
        }

        return arr;
    }

    static MultiplyDistanceMaps(mapsToAdd: MapArray[]) {
        let arr = new Array(ROOM_ARRAY_SIZE).fill(0);
        let idLength = mapsToAdd.length;
        for (let i = 0; i < ROOM_ARRAY_SIZE; i++) {
            let total = 1;
            for (let j = 0; j < idLength; j++) {
                total *= mapsToAdd[j][i];
            }
            arr[i] = total;
        }

        return arr;
    }

    static AverageDistanceMaps(mapsToAdd: MapArray[]) {
        let arr = new Array(ROOM_ARRAY_SIZE).fill(0);
        let idLength = mapsToAdd.length;
        for (let i = 0; i < ROOM_ARRAY_SIZE; i++) {
            let total = 0;
            for (let j = 0; j < idLength; j++) {
                total += mapsToAdd[j][i];
            }
            arr[i] = Math.ceil(total / idLength);
        }

        return arr;
    }

    static CreateDistanceMap(room: Room, targetPositions: RoomPosition[], maxDistance: number = MAX_MAP_DIST) {
        if (maxDistance < 0 || maxDistance > MAX_MAP_DIST) {
            maxDistance = MAX_MAP_DIST;
        }
        let arr: MapArray = new Array(ROOM_ARRAY_SIZE).fill(0);
        let pendingNodes: { x: number, y: number, dist: number, index: number }[] = [];
        for (let i = 0; i < targetPositions.length; i++) {
            pendingNodes.push({
                x: targetPositions[i].x, y: targetPositions[i].y, dist: 0,
                index: DistMap.ConvertXYToIndex(targetPositions[i].x, targetPositions[i].y)
            });
            arr[targetPositions[i].y * ROOM_WIDTH + targetPositions[i].x] = START_TOKEN;
        }

        while (pendingNodes.length > 0) {
            let curNode = pendingNodes.shift();
            if (!curNode) {
                break;
            }
            let neighbors = neighborMapping[curNode.index];
            let keys = (Object.keys(neighbors) as any) as number[];
            let nextDist = curNode.dist + (curNode.dist < maxDistance ? 1 : 0);
            for (let i = 0; i < keys.length; i++) {
                let neighbor = neighbors[keys[i]];
                if (arr[neighbor.y * ROOM_WIDTH + neighbor.x] !== 0 || Game.map.getTerrainAt(neighbor.x, neighbor.y, room.name) == Terrain_Wall) {
                    continue;
                }

                arr[neighbor.index] = nextDist;
                pendingNodes.push({
                    x: neighbor.x,
                    y: neighbor.y,
                    dist: nextDist,
                    index: neighbor.index
                });
            }
        }

        return arr;
    }
}