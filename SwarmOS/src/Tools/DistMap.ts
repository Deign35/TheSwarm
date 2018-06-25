global['ROOM_HEIGHT'] = 50;
global['ROOM_WIDTH'] = 50;
global['ROOM_ARRAY_SIZE'] = ROOM_HEIGHT * ROOM_WIDTH;

// MaxDistance of 99 so max of 2 digits.  For saving mem space, change to 999 for 3 digit max distance
const MAX_MAP_DIST = 99;
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
        let pendingNodes: { x: number, y: number, dist: number }[] = [];
        for (let i = 0; i < targetPositions.length; i++) {
            pendingNodes.push({ x: targetPositions[i].x, y: targetPositions[i].y, dist: 0 });
            arr[targetPositions[i].y * ROOM_WIDTH + targetPositions[i].x] = -1;
        }

        while (pendingNodes.length > 0) {
            let curNode = pendingNodes.shift();
            if (!curNode) {
                break;
            }
            let neighbors = this.GetNeighborNodes(curNode.x, curNode.y);
            let nextDist = curNode.dist + (curNode.dist < maxDistance ? 1 : 0);
            for (let i = 0; i < neighbors.length; i++) {
                let xPos = neighbors[i].x;
                let yPos = neighbors[i].y;
                if (xPos < 0 || xPos >= ROOM_WIDTH || yPos < 0 || yPos >= ROOM_HEIGHT ||
                    arr[neighbors[i].y * ROOM_WIDTH + neighbors[i].x] !== 0 || Game.map.getTerrainAt(xPos, yPos, room.name) == Terrain_Wall) {
                    continue;
                }

                arr[this.ConvertXYToIndex(xPos, yPos)] = nextDist;
                pendingNodes.push({
                    x: neighbors[i].x,
                    y: neighbors[i].y,
                    dist: nextDist
                });
            }
        }

        return arr;
    }

    protected static GetNeighborNodes(x: number, y: number) {
        return [
            { x: x - 1, y: y - 1 },
            { x: x - 1, y },
            { x: x - 1, y: y + 1 },
            { x, y: y - 1 },
            { x, y: y + 1 },
            { x: x + 1, y: y - 1 },
            { x: x + 1, y },
            { x: x + 1, y: y + 1 },
        ];
    }
}