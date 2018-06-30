import { RoomMonitorBase } from "RoomJobs/RoomMonitors";

const RESTART_TOKEN = -1;
class RoomRoadGenerator extends RoomMonitorBase<RoomMonitor_Memory> {
    private stage: number = 0;
    private cache: any = {};
    MonitorRoom(): ThreadState {
        if (this.roomData.RoomType.type != RT_Home) {
            this.log.error(`Map generation for rooms not under home control has not been enabled yet`);
            return ThreadState_Done;
        }
        if (!this.room) {
            return ThreadState_Done;
        }
        switch (this.stage) {
            case (0):
                this.GenerateNewMapAt('curMap', this.room.controller!.pos);
                break;
            case (1):
                let newPositions = this.room.find(FIND_MY_SPAWNS).map((spawn) => {
                    return spawn.pos;
                });
                this.AddPointsToMap('curMap', newPositions);
                break;

            default:
                this.cache = {}
                this.stage = 0;
                this.log.info(`Restarting RoadGeneration for ${this.memory.rID}`);
                break;
        }
        this.stage += 1;
        if (this.room.name == 'sim') {
            return this.stage % 5 == 0 ? ThreadState_Done : ThreadState_Active;
        }
        return ThreadState_Done;
    }
    GenerateNewMapAt(mapName: string, startPos: RoomPosition) {
        this.cache[mapName] = DistMap.CreateDistanceMap(this.room!, [startPos]);
    }

    AddPointsToMap(mapName: string, newPoints: RoomPosition[]) {
        let newMap = DistMap.CreateDistanceMap(this.room!, newPoints);
        this.cache[mapName] = DistMap.MinDistanceMaps([newMap, this.cache[mapName]]);
    }

    MakeRoadToPoint(map: MapArray, point: RoomPosition, distance: number = 1) {
        let curMax = map[DistMap.ConvertXYToIndex(point.x, point.y)];
        let remainingTiles = [{ x: point.x, y: point.y, dist: curMax }];
        let path: { x: number, y: number, dist: number }[] = [];
        do {
            let next = remainingTiles.shift();
            if (!next) {
                break;
            }
            path.push(next);
            
            if (next.dist < distance || next.dist <= 0) {
                break;
            }
            if (next.dist < curMax) {
                curMax = next.dist;
            }
            if (next.dist > curMax) {
                this.log.alert(`ASSUMPTION VIOLATION: Currently MakeRoadToPoint is assumed to never put larger values into the search array`);
                continue;
            }

            let neighbors = DistMap.GetNeighborNodes(next.x, next.y);
            for (let i = 0; i < neighbors.length; i++) {
                let nextIndex = DistMap.ConvertXYToIndex(neighbors[i].x, neighbors[i].y);
                if (map[nextIndex] < next.dist) {
                    remainingTiles.push({ x: neighbors[i].x, y: neighbors[i].y, dist: map[nextIndex] });
                    break;
                }
            }
            if (remainingTiles.length > 1) {
                this.log.alert(`ASSUMPTION VIOLATION: Should only be one position per loop`);
            }
        } while (true);

        if (path[path.length - 1].dist != distance) {
            this.log.alert(`ASSUMPTION VIOLATION: Path is expected to end at the requested distance.  Path.dist: {${path[path.length - 1]}, vs requestedDistance: {${distance}}`);
        }
        for (let i = 0; i < path.length; i++) {
            this.room!.createConstructionSite(path[i].x, path[i].y, STRUCTURE_ROAD);
        }
    }
}