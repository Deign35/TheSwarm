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

    MakeRoadToPoint(map: MapArray, point: RoomPosition) {
        let remainingTiles = [{ x: point.x, y: point.y, dist: 1000 }];
        do {
            let next = remainingTiles.shift();
            if (!next) {
                break;
            }

            let neighbors = DistMap.GetNeighborNodes(next.x, next.y);
            for (let i = 0; i < neighbors.length; i++) {
                let nextIndex = DistMap.ConvertXYToIndex(neighbors[i].x, neighbors[i].y);

            }
        } while (true);
    }
}