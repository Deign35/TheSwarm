export const OSPackage: IPackage<SpawnRegistry_Memory> = {
    install(processRegistry: IProcessRegistry, extensionRegistry: IExtensionRegistry) {
        processRegistry.register(RJ_RoadGenerator, RoomRoadGenerator);
    }
}

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
        if (!this.room || !this.roomData.distanceMaps[ML_Impassable || !this.roomData.distanceMaps[ML_Road]]) {
            return ThreadState_Done;
        }

        debugger;
        let isThreadComplete = true;
        switch (this.stage) {
            case (0):
                this.cache['FocalPoints'] = [];
                this.GenerateNewMapAt('curMap', this.room.controller!.pos);
                this.cache['FocalPoints'].push(this.room.controller!.pos);
                break;
            case (1):
                let spawnPositions = this.room.find(FIND_MY_SPAWNS).map((spawn) => {
                    this.cache['FocalPoints'].push(spawn.pos);
                    return spawn.pos;
                });
                //this.AddPointsToMap('curMap', spawnPositions);*/
                for (let i = 0; i < spawnPositions.length; i++) {
                    this.MakeRoadFromPoint(this.cache['curMap'], spawnPositions[i], 3);
                }
                this.sleeper.sleep(this.pid, 10);
                this.cache = {};
                break;
            /*case (2):
                let spawns = this.room.find(FIND_MY_SPAWNS);
                if (spawns.length <= 0) {
                    throw new Error(`RoomRoadGenerator spawn length = 0`);
                }
                this.GenerateNewMapAt('curMap', spawns[0].pos);
                break;
            case (3):
                this.cache['extPositions'] = this.room.find(FIND_STRUCTURES, {
                    filter: (struct) => {
                        return struct.structureType == STRUCTURE_EXTENSION;
                    }
                }).map((extension) => {
                    this.cache['FocalPoints'].push(extension.pos);
                    return extension.pos;
                });
                break;*/
            default:
                this.cache = {}
                //this.stage = 0;
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

    MakeRoadFromPoint(map: MapArray, point: RoomPosition, distance: number = 1) {
        let curMax = map[DistMap.ConvertXYToIndex(point.x, point.y)];
        let remainingTiles = [{ x: point.x, y: point.y, dist: curMax }];
        let path: { x: number, y: number, dist: number }[] = [];
        let roadMap = this.roomData.distanceMaps[ML_Road];
        let impassableMap = this.roomData.distanceMaps[ML_Impassable];
        do {
            let next = remainingTiles.shift();
            if (!next) {
                break;
            }
            path.push(next);

            if (next.dist <= distance || next.dist <= 0) {
                break;
            }
            if (next.dist < curMax) {
                curMax = next.dist;
            }
            if (next.dist > curMax) {
                this.log.alert(`ASSUMPTION VIOLATION: Currently MakeRoadFromPoint is assumed to never put larger values into the search array`);
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
                this.log.alert(`ASSUMPTION VIOLATION: MakeRoadFromPoint.. Should only be one position per loop`);
            }
        } while (true);

        if (path[path.length - 1].dist != distance) {
            this.log.alert(`ASSUMPTION VIOLATION: MakeRoadFromPoint.. Path is expected to end at the requested distance.  Path.dist: {${path[path.length - 1].dist}, vs requestedDistance: {${distance}}`);
        }
        for (let i = 0; i < path.length; i++) {
            let index = DistMap.ConvertXYToIndex(path[i].x, path[i].y);
            if (roadMap[index] == 0 &&
                impassableMap[index] != 0) {
                this.room!.createConstructionSite(path[i].x, path[i].y, STRUCTURE_ROAD);
            }
        }
    }
}