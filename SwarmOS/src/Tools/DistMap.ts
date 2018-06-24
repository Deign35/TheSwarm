global['ROOM_HEIGHT'] = 50;
global['ROOM_WIDTH'] = 50;
global['ROOM_ARRAY_SIZE'] = ROOM_HEIGHT * ROOM_WIDTH;

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

    // MaxDistance of 99 so max of 2 digits.  For saving mem space
    static CreateDistanceMap(room: Room, targetPositions: RoomPosition[], maxDistance: number = 99) {
        let arr = new Array(ROOM_ARRAY_SIZE).fill(0);
        let pendingNodes = [];
        for (let i = 0; i < targetPositions.length; i++) {
            pendingNodes.push({ x: targetPositions[i].x, y: targetPositions[i].y, dist: 0 });
            arr[targetPositions[i].y * 50 + targetPositions[i].x] = -1;
        }

        while (pendingNodes.length > 0) {
            let curNode = pendingNodes.shift();
            if (!curNode) {
                break;
            }
            let neighbors = this.GetNeighborNodes(curNode.x, curNode.y);
            for (let i = 0; i < neighbors.length; i++) {
                let xPos = neighbors[i].x;
                let yPos = neighbors[i].y;
                if (xPos < 0 || xPos >= 50 || yPos < 0 || yPos >= 50 || curNode.dist > maxDistance ||
                    arr[neighbors[i].y * 50 + neighbors[i].x] !== 0 || Game.map.getTerrainAt(xPos, yPos, room.name) == Terrain_Wall) {
                    /*if(neighbors[i].dist == 0) {
                        arr[yPos * 50 + xPos] = -2;
                    }*/
                    continue;
                }
                arr[yPos * 50 + xPos] = curNode.dist + 1;
                pendingNodes.push({
                    x: neighbors[i].x,
                    y: neighbors[i].y,
                    dist: curNode.dist + 1
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