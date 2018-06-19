export const OSPackage: IPackage<SpawnRegistry_Memory> = {
    install(processRegistry: IProcessRegistry, extensionRegistry: IExtensionRegistry) {
        processRegistry.register(RJ_Harvest, RoomStateHarvestActivity);
    }
}

import { RoomStateActivity } from "./RoomStateActivities";
import { FindNextTo, FindStructureNextTo } from "Tools/TheFinder";

class RoomStateHarvestActivity extends RoomStateActivity<RoomStateHarvest_Memory> {
    @extensionInterface(EXT_CreepActivity)
    protected creepActivity!: ICreepActivityExtensions;
    @extensionInterface(EXT_CreepRegistry)
    protected creepRegistry!: ICreepRegistryExtensions;
    RunThread(): ThreadState {
        if (this.memory.nb) {
            this.BootHarvest();
            delete this.memory.nb;
        }
        let keys = Object.keys(this.memory.harvesters);
        for (let i = 0; i < keys.length; i++) {
            let mem = this.memory.harvesters[keys[i]];
            if (!mem.pid || this.kernel.getProcessByPID(mem.pid!)) {
                this.SpawnHarvester(keys[i]);
            }

            if (mem.sup) {
                let obj = Game.getObjectById(mem.sup);
                if (!obj) {
                    delete mem.sup;
                }
            }

            if (this.room) {
                if (!mem.sup) {
                    let source = Game.getObjectById(keys[i]) as Source;
                    let nearbyContainers = FindStructureNextTo(source.pos, STRUCTURE_CONTAINER);
                    if (nearbyContainers && nearbyContainers.length > 0) {
                        mem.sup = nearbyContainers[0].structure.id;
                    } else {
                        let nearbyCSites = FindNextTo(source.pos, LOOK_CONSTRUCTION_SITES);
                        if (nearbyCSites) {
                            for (let i = 0; i < nearbyCSites.length; i++) {
                                if ((nearbyCSites[i].constructionSite as ConstructionSite).structureType == STRUCTURE_CONTAINER) {
                                    mem.sup = (nearbyCSites[i].constructionSite as ConstructionSite).id;
                                    break;
                                }
                            }
                        }
                    }
                }
            }
        }
        return ThreadState_Done;
    }

    BootHarvest() {
        let keys = Object.keys(this.memory.harvesters);
        for (let i = 0; i < keys.length; i++) {
            this.kernel.killProcess(this.memory.harvesters[keys[i]].pid);
        }
        this.memory.harvesters = {};
        if (this.room) {
            this.roomData.sourceIDs = this.room.find(FIND_SOURCES)!.map((val: Source) => {
                return val.id;
            });
        }
        for (let i = 0; i < this.roomData.sourceIDs.length; i++) {
            this.memory.harvesters[this.roomData.sourceIDs[i]] = {};
        }
    }

    SpawnHarvester(sourceID: ObjectID) {
        this.memory.lu = Game.time;
        let spawnLevel = 0;
        let priority: Priority = Priority_Medium;
        if (this.memory.hr != this.memory.rID) {
            spawnLevel = 2;
            priority = Priority_Low;
        } else {
            let homeRoom = Game.rooms[this.memory.hr];
            if (homeRoom.energyCapacityAvailable >= CreepBodies.Harvester[2].cost) {
                spawnLevel = 2;
            } else if (homeRoom.energyCapacityAvailable >= CreepBodies.Harvester[1].cost) {
                spawnLevel = 1;
            } else {
                let source = Game.getObjectById(sourceID) as Source;
                if (source) {
                    let nearby = FindNextTo(source.pos, LOOK_TERRAIN);
                    let hasSpawnedSupport = false;
                    let hasSpawnedHarvester = false;
                    for (let i = 0; i < nearby.length; i++) {
                        if (nearby[i].terrain !== Terrain_Wall) {
                            if (!hasSpawnedHarvester) {
                                hasSpawnedHarvester = true;
                                continue;
                            }
                            this.log.info(`Spawning a harvester for ${this.roomData.sourceIDs[i]}.`);
                            this.SpawnSupport(sourceID);
                            if (hasSpawnedSupport) {
                                break;
                            }
                            hasSpawnedSupport = true;
                        }
                    }
                }
            }
        }

        let spawnID = this.spawnRegistry.requestSpawn({
            l: spawnLevel,
            c: CT_Harvester,
            n: this.memory.rID + '_' + (Game.time + '_Ha').slice(-5),
            p: this.pid,
        }, this.memory.rID, priority, 3, {
                ct: CT_Harvester,
                lvl: spawnLevel,
                p: this.pid,
                s: sourceID
            });
        let spawnMem: SpawnActivity_Memory = {
            sID: spawnID,
            HC: "HarvestSourceActivity"
        }

        this.memory.harvesters[sourceID].pid = this.kernel.startProcess(SPKG_SpawnActivity, spawnMem);
    }

    HarvestSourceActivity(creepID: CreepID) {
        if (!this.creepRegistry.tryReserveCreep(creepID, this.pid)) {
            return;
        }

        let creep = this.creepRegistry.tryGetCreep(creepID, this.pid);
        if (!creep || !creep.memory.s) {
            this.creepRegistry.releaseCreep(creepID, this.pid);
            return;
        }

        let source = Game.getObjectById(creep.memory.s) as Source;
        if (creep.room.name != this.memory.rID) {
            let map = Game.map.findRoute(creep.room.name, this.memory.rID);
            let nextRoom = this.memory.rID;
            if (map == ERR_NO_PATH) {
                this.log.error(`Could not find a route between two rooms`);
                return;
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
                this.log.error('Attempted to find a path to the next room, but failed');
                return;
            }

            this.memory.harvesters[creep.memory.s].pid = this.creepActivity.CreateNewCreepActivity({
                at: AT_MoveToPosition,
                c: creep.name,
                HC: 'HarvestSourceActivity',
                p: { x: lastPosition.x, y: lastPosition.y, roomName: creep.room.name }
            }, this.pid);
            return;
        }

        if (!creep.pos.isNearTo(source.pos)) {

        }

        let actions: SingleCreepActivity_Memory[] = [];
        let moveTarget = Game.getObjectById<ConstructionSite | StructureContainer>(this.memory.harvesters[creep.memory.s].sup);
        if (!creep.memory.sup && moveTarget) {
            this.memory.harvesters[creep.memory.s].pid = this.creepActivity.CreateNewCreepActivity({
                at: AT_MoveToPosition,
                p: moveTarget.pos,
                c: creep.name,
                HC: 'HarvestSourceActivity'
            }, this.pid);
            return;
        }

        let harvMem: RepetitiveCreepActivity_Memory = {
            a: [{
                at: AT_Harvest,
                t: creep.memory.s,
                e: [ERR_FULL, ERR_NOT_ENOUGH_RESOURCES]
            }],
            HC: 'HarvestSourceActivity',
            c: creepID
        }
        this.memory.harvesters[creep.memory.s].pid = this.kernel.startProcess(SPKG_RepetitiveCreepActivity, harvMem);
    }

    SpawnSupport(sourceID: ObjectID) {
        let spawnID = this.spawnRegistry.requestSpawn({
            l: 0,
            c: CT_Harvester,
            n: GetSUID() + '_HS',
            p: this.pid
        }, this.memory.rID, Priority_Low, 3, {
                ct: CT_Harvester,
                lvl: 0,
                p: this.pid,
                s: sourceID,
                sup: true
            });
        let spawnMem: SpawnActivity_Memory = {
            sID: spawnID,
            HC: "HarvestSourceActivity"
        }
        this.kernel.startProcess(SPKG_SpawnActivity, spawnMem);
    }
}