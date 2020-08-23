export const OSPackage: IPackage<SpawnRegistry_Memory> = {
    install(processRegistry: IProcessRegistry, extensionRegistry: IExtensionRegistry) {
        processRegistry.register(CJ_RemoteHarvest, RemoteHarvester);
    }
}
import { SoloJob } from "./SoloJob";

class RemoteHarvester extends SoloJob<RemoteHarvester_Memory> {
    RunThread(): ThreadState {
        let creep = Game.creeps[this.memory.c!];
        if (!creep || (!creep.spawning && creep.ticksToLive! < 80)) {
            delete this.memory.c;
            delete this.memory.a;
        }
        return super.RunThread();
    }

    protected GetNewSpawnID(): string {
        let targetRoom = Game.rooms[this.memory.tr];
        let spawnLevel = 2; // (TODO): Update this value based on if targetRoom is reserved
        let homeRoom = Game.rooms[this.memory.rID];
        return this.spawnRegistry.requestSpawn({
            l: spawnLevel,
            c: CT_Harvester,
            n: this.memory.rID + '_RH' + this.memory.src.slice(-1),
            p: this.pid
        }, this.memory.rID, Priority_Low, 3, {
                ct: CT_Harvester,
                lvl: spawnLevel,
                p: this.pid
            });
    }
    protected CreateCustomCreepActivity(creep: Creep): string | undefined {
        let targetRoom = Game.rooms[this.memory.tr];
        if (!targetRoom) {
            let path = creep.pos.findPathTo(new RoomPosition(25, 25, this.memory.tr), {
                ignoreCreeps: true,
                ignoreRoads: true
            });
            let lastPosition = path[path.length - 1];
            if (!lastPosition) {
                throw new Error(`Remote Harvester attempted to find a path to the next room, but failed`);
            }

            return this.creepActivity.CreateNewCreepActivity({
                at: AT_MoveToPosition,
                c: creep.name,
                p: { x: lastPosition.x, y: lastPosition.y, roomName: creep.room.name }
            }, this.pid);
        }

        let source = Game.getObjectById<Source>(this.memory.src)!;
        let container = Game.getObjectById<StructureContainer | ConstructionSite>(this.memory.sup);

        if (source.pos.getRangeTo(creep.pos) > 1) {
            if (container) {
                return this.creepActivity.CreateNewCreepActivity({
                    at: AT_MoveToPosition,
                    c: creep.name,
                    p: { x: container.pos.x, y: container.pos.y, roomName: this.memory.tr }
                }, this.pid);
            } else {
                // (TODO): Test perf for find path options
                let path = creep.pos.findPathTo(source.pos, {
                    range: 1,
                    ignoreCreeps: true,
                    ignoreDestructibleStructures: true,
                    ignoreRoads: true
                });
                let lastPosition = path[path.length - 1];
                if (!lastPosition) {
                    throw new Error(`Remote Harvester attempted to find a path to the next room, but failed`);
                }

                return this.creepActivity.CreateNewCreepActivity({
                    at: AT_MoveToPosition,
                    c: creep.name,
                    p: { x: lastPosition.x, y: lastPosition.y, roomName: creep.room.name }
                }, this.pid);
            }
        }
        if (!container) {
            let containers = creep.pos.lookFor(LOOK_STRUCTURES);
            if (containers && containers.length > 0) {
                for (let i = 0; i < containers.length; i++) {
                    if (containers[i].structureType == STRUCTURE_CONTAINER) {
                        this.memory.sup = containers[i].id;
                        container = containers[i] as StructureContainer;
                    }
                }
            }
            if (!container) {
                let sites = creep.pos.lookFor(LOOK_CONSTRUCTION_SITES);
                if (sites && sites.length > 0) {
                    this.memory.sup = sites[0].id;
                    container = sites[0];
                } else {
                    creep.room.createConstructionSite(creep.pos, STRUCTURE_CONTAINER);
                    return this.creepActivity.CreateNewCreepActivity({
                        at: AT_Harvest,
                        c: creep.name,
                        t: source.id
                    }, this.pid);
                }
            }
        }

        if ((container as ConstructionSite).progressTotal) {
            if (creep.store[RESOURCE_ENERGY] == creep.store.getCapacity()) {
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