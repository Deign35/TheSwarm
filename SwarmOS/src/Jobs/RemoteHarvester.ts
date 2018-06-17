export const OSPackage: IPackage<SpawnRegistry_Memory> = {
    install(processRegistry: IProcessRegistry, extensionRegistry: IExtensionRegistry) {
        processRegistry.register(CJ_RemoteHarvest, RemoteHarvester);
    }
}
import { SoloJob } from "./SoloJob";
import { FindStructureNextTo } from "Tools/TheFinder";

class RemoteHarvester extends SoloJob<RemoteHarvester_Memory> {
    RunThread(): ThreadState {
        let homeRoomData = this.View.GetRoomData(this.memory.rID)!;
        let provider = this.kernel.getProcessByPID(homeRoomData.activityPID);
        if (provider && provider['RoomJobCheckin']) {
            provider['RoomJobCheckin'](this.pkgName);
        }
        let creep = Game.creeps[this.memory.c!];
        if (creep && !creep.spawning && creep.ticksToLive! < 80) {
            delete this.memory.c;
            delete this.memory.a;
        }
        return super.RunThread();
    }

    protected GetNewSpawnID(): string {
        let targetRoom = Game.rooms[this.memory.tr];
        let spawnLevel = 2;
        let homeRoom = Game.rooms[this.memory.rID];
        return this.spawnRegistry.requestSpawn({
            l: spawnLevel,
            c: CT_Harvester,
            n: this.memory.tr + '_RH' + this.memory.src.slice(-1),
            p: this.pid
        }, this.memory.tr, Priority_Low, 3, {
                ct: CT_Harvester,
                lvl: spawnLevel,
                p: this.pid
            });
    }
    protected CreateCustomCreepActivity(creep: Creep): string | undefined {
        let targetRoom = Game.rooms[this.memory.tr];
        if (!targetRoom) {
            let map = Game.map.findRoute(creep.room.name, this.memory.tr);
            let nextRoom = this.memory.tr;
            if (map == ERR_NO_PATH) {
                delete this.memory.tr
                return this.creepActivity.CreateNewCreepActivity({
                    at: AT_MoveToPosition,
                    p: creep.pos,
                    c: creep.name
                }, this.pid)
            }
            if (map && map.length > 0) {
                nextRoom = map[0].room;
            }
            let path = creep.pos.findPathTo(new RoomPosition(25, 25, nextRoom), {
                ignoreCreeps: true,
                ignoreRoads: true
            });
            let lastPosition = path[path.length - 1];
            if (!lastPosition) {
                throw new Error(`Remote Harvester attempted to find a path to the next room, but failed`);
            }
            if (lastPosition.x == 0) {
                lastPosition.x = 49;
            } else if (lastPosition.x == 49) {
                lastPosition.x = 0;
            }
            if (lastPosition.y == 0) {
                lastPosition.y = 49;
            } else if (lastPosition.y == 49) {
                lastPosition.y = 0;
            }

            return this.creepActivity.CreateNewCreepActivity({
                at: AT_MoveToPosition,
                c: creep.name,
                p: { x: lastPosition.x, y: lastPosition.y, roomName: nextRoom }
            }, this.pid);
        }

        let source = Game.getObjectById<Source>(this.memory.src)!;
        let container = Game.getObjectById<StructureContainer | ConstructionSite>(this.memory.sup);

        if (source.pos.getRangeTo(creep.pos) > 1) {
            return this.creepActivity.CreateNewCreepActivity({
                at: AT_MoveToPosition,
                c: creep.name,
                p: container ? container.pos : source.pos,
                a: container ? 0 : 1
            }, this.pid);
        } else if (!container) {
            let structures = FindStructureNextTo(source.pos, STRUCTURE_CONTAINER);
            if (structures && structures.length > 0) {
                container = structures[0].structure as StructureContainer;
            } else {
                let sites = creep.pos.lookFor(LOOK_CONSTRUCTION_SITES);
                if (sites && sites.length > 0) {
                    for (let i = 0; i < sites.length; i++) {
                        if (sites[i].structureType == STRUCTURE_CONTAINER) {
                            container = sites[i];
                            break;
                        }
                    }
                }
            }

            if (!container) {
                creep.room.createConstructionSite(creep.pos, STRUCTURE_CONTAINER);
                return this.creepActivity.CreateNewCreepActivity({
                    at: AT_Harvest,
                    c: creep.name,
                    t: source.id
                }, this.pid);
            } else {
                this.memory.sup = container.id;
            }
        }

        if ((container as ConstructionSite).progressTotal) {
            if (creep.carry.energy > 0) {
                return this.creepActivity.CreateNewCreepActivity({
                    at: AT_Build,
                    c: creep.name,
                    t: container.id
                }, this.pid);
            } else {
                return this.creepActivity.CreateNewCreepActivity({
                    at: AT_Harvest,
                    c: creep.name,
                    t: source.id
                }, this.pid);
            }
        } else {
            if (source.energy == 0 && (container as StructureContainer).hits < (container as StructureContainer).hitsMax) {
                return this.creepActivity.CreateNewCreepActivity({
                    at: AT_Repair,
                    c: creep.name,
                    t: container.id
                }, this.pid);
            }
        }

        return this.creepActivity.CreateNewCreepActivity({
            t: source.id,
            at: AT_Harvest,
            c: creep.name,
            e: [ERR_FULL]
        }, this.pid);
    }
}