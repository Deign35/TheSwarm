export const OSPackage: IPackage<SpawnRegistry_Memory> = {
    install(processRegistry: IProcessRegistry, extensionRegistry: IExtensionRegistry) {
        processRegistry.register(CJ_Harvest, Harvester);
    }
}
import { SoloJob } from "./SoloJob";
import { FindNextTo, FindStructureNextTo } from "Tools/TheFinder";

class Harvester extends SoloJob<HarvesterMemory> {
    @extensionInterface(EXT_RoomView)
    protected View!: IRoomDataExtension;
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
        let targetRoom = Game.rooms[this.memory.rID];
        let spawnLevel = 0; // (TODO): Update this value based on if targetRoom is reserved
        if (targetRoom.energyCapacityAvailable >= CreepBodies.Harvester[2].cost) {
            spawnLevel = 2;
        } else if (targetRoom.energyCapacityAvailable >= CreepBodies.Harvester[1].cost) {
            spawnLevel = 1;
        } else {
            let source = Game.getObjectById<ObjectTypeWithID>(this.memory.src)!;
            let nearby = FindNextTo(source.pos, LOOK_TERRAIN);
            let hasSpawnedSupport = false;
            let hasSpawnedHarvester = false;
            for (let i = 0; i < nearby.length; i++) {
                if (nearby[i].terrain !== 'wall') {
                    if (!hasSpawnedHarvester) {
                        hasSpawnedHarvester = true;
                        continue;
                    }
                    this.log.info(`Spawning a harvester for ${this.memory.src}.`);
                    this.SpawnSupportHarvester();
                    if (hasSpawnedSupport) {
                        break;
                    }
                    hasSpawnedSupport = true;
                }
            }
        }
        this.log.info(`Spawning a harvester for ${this.memory.src}.`);
        return this.spawnRegistry.requestSpawn({
            l: spawnLevel,
            c: CT_Harvester,
            n: this.memory.rID + '_H' + this.memory.src.slice(-1),
            p: this.pid
        }, this.memory.rID, Priority_Medium, 3, {
                ct: CT_Harvester,
                lvl: spawnLevel,
                p: this.pid
            });
    }
    protected CreateCustomCreepActivity(creep: Creep): string | undefined {
        let targetRoom = Game.rooms[this.memory.rID];
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
        let container = Game.getObjectById<StructureContainer | ConstructionSite>(this.memory.sup);
        let source = Game.getObjectById<Source>(this.memory.src)!;

        if (!container) {
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

        if (source.pos.getRangeTo(creep.pos) > 1) {
            return this.creepActivity.CreateNewCreepActivity({
                at: AT_MoveToPosition,
                c: creep.name,
                p: container ? container.pos : source.pos,
                a: container ? 0 : 1
            }, this.pid);
        }

        if (source.energy > 0) {
            return this.creepActivity.CreateNewCreepActivity({
                t: source.id,
                at: AT_Harvest,
                c: creep.name,
                e: [ERR_FULL]
            }, this.pid);
        }

        if (creep.carry.energy > 0) {
            if (container) {
                if ((container as StructureContainer).hitsMax) {
                    if (((container as StructureContainer).hits + (REPAIR_POWER * creep.getActiveBodyparts(WORK))) <= (container as StructureContainer).hitsMax) {
                        return this.creepActivity.CreateNewCreepActivity({
                            at: AT_Repair,
                            c: creep.name,
                            t: container.id
                        }, this.pid)
                    }
                } else if ((container as ConstructionSite).progressTotal) {
                    return this.creepActivity.CreateNewCreepActivity({
                        at: AT_Build,
                        c: creep.name,
                        t: container.id
                    }, this.pid);
                } else {
                    delete this.memory.sup;
                }
            }
        }

        return;
    }
    HandleNoActivity() {
        // Do Nothing;
    }

    SpawnSupportHarvester() {
        let sID = this.spawnRegistry.requestSpawn({
            c: CT_Harvester,
            l: 0,
            n: 'SH' + GetRandomIndex(primes_100),
            p: this.pid
        }, this.memory.rID, Priority_High, 1, {
                ct: CT_Harvester,
                lvl: 0,
                p: this.pid
            });

        let newSpawnActivityMem: SpawnActivity_Memory = {
            sID: sID,
            HC: 'SupportHarvesterHC'
        }
        let newPID = this.kernel.startProcess(SPKG_SpawnActivity, newSpawnActivityMem);
        this.kernel.setParent(newPID, this.pid);
    }

    // (TODO): Set this up to auto refresh itself by checking energyCapacity
    // Problem right now with this is not spawning them over and over (use the RoomBooter?)
    SupportHarvesterHC(creepID: CreepID) {
        let newMem: RepetitiveCreepActivity_Memory = {
            a: [{
                at: AT_Harvest,
                e: [ERR_FULL, ERR_NOT_ENOUGH_ENERGY],
                t: this.memory.src,
            }],
            c: creepID,
        }

        let newPID = this.kernel.startProcess(SPKG_RepetitiveCreepActivity, newMem);
        this.kernel.setParent(newPID, this.pid);
    }
}