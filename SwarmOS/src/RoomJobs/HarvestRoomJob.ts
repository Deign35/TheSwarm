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
        if (this.roomData.RoomType.type != RT_Home && this.roomData.RoomType.type != RT_RemoteHarvest) {
            return ThreadState_Done;
        }
        if (this.memory.nb) {
            this.BootHarvest();
        }
        let keys = Object.keys(this.memory.harvesters);
        for (let i = 0; i < keys.length; i++) {
            let mem = this.memory.harvesters[keys[i]];
            if (!mem.pid || !this.kernel.getProcessByPID(mem.pid!)) {
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

        if (!this.room) {
            return;
        }
        let sources = this.room.find(FIND_SOURCES);
        this.roomData.EnergyIncomeRate = 0;
        for (let i = 0; i < sources.length; i++) {
            this.roomData.EnergyIncomeRate += sources[i].energyCapacity / ENERGY_REGEN_TIME;
            this.memory.harvesters[sources[i].id] = {};
        }
        delete this.memory.nb;
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
                            this.log.info(`Spawning a support harvester for ${sourceID}.`);
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

        this.log.info(`Spawning a harvester for ${sourceID}.`);
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
        this.kernel.setParent(this.memory.harvesters[sourceID].pid!, this.pid);
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
        let newPID = this.kernel.startProcess(SPKG_SpawnActivity, spawnMem);
        this.kernel.setParent(newPID, this.pid);
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

            let newPID = this.creepActivity.CreateNewCreepActivity({
                at: AT_MoveToPosition,
                c: creep.name,
                HC: 'HarvestSourceActivity',
                p: { x: lastPosition.x, y: lastPosition.y, roomName: creep.room.name }
            }, this.pid);
            if (!creep.memory.sup) {
                this.memory.harvesters[creep.memory.s].pid = newPID;
            }
            return;
        }

        let moveTarget = Game.getObjectById<ConstructionSite | StructureContainer>(this.memory.harvesters[creep.memory.s].sup);
        if (!creep.memory.sup && (!moveTarget || (moveTarget as ConstructionSite).progressTotal)) {
            this.memory.harvesters[creep.memory.s].pid = this.creepActivity.CreateNewCreepActivity({
                at: AT_MoveToPosition,
                p: moveTarget ? moveTarget.pos : source.pos,
                a: moveTarget ? 0 : 1,
                c: creep.name,
                HC: 'ConstructContainerActivity'
            }, this.pid)
            return;
        }

        if (!creep.memory.sup && moveTarget && !creep.pos.isEqualTo(moveTarget.pos)) {
            this.memory.harvesters[creep.memory.s].pid = this.creepActivity.CreateNewCreepActivity({
                at: AT_MoveToPosition,
                p: moveTarget.pos,
                c: creep.name,
                HC: 'HarvestSourceActivity'
            }, this.pid);
            return;
        }

        let newPID = this.creepActivity.CreateNewCreepActivity({
            at: AT_Harvest,
            c: creep.name,
            HC: 'HarvestSourceActivity',
            t: creep.memory.s,
            e: [ERR_FULL, ERR_NOT_ENOUGH_RESOURCES],
        }, this.pid);
        if (!creep.memory.sup) {
            this.memory.harvesters[creep.memory.s].pid = newPID;
        }
    }

    ConstructContainerActivity(creepID: CreepID) {
        if (!this.creepRegistry.tryReserveCreep(creepID, this.pid)) {
            return;
        }

        let creep = this.creepRegistry.tryGetCreep(creepID, this.pid);
        if (!creep || !creep.memory.s) {
            this.creepRegistry.releaseCreep(creepID, this.pid);
            return;
        }

        let source = Game.getObjectById(creep.memory.s) as Source;
        let constructionSite = Game.getObjectById<ConstructionSite>(this.memory.harvesters[creep.memory.s].sup);
        if (!constructionSite) {
            let structures = FindStructureNextTo(source.pos, STRUCTURE_CONTAINER);
            if (structures && structures.length > 0) {
                let container = structures[0].structure as StructureContainer;
                this.memory.harvesters[creep.memory.s].sup = container.id;
                this.memory.harvesters[creep.memory.s].pid = this.creepActivity.CreateNewCreepActivity({
                    at: AT_Harvest,
                    c: creep.name,
                    HC: 'HarvestSourceActivity',
                    t: creep.memory.s,
                }, this.pid);
                return;
            } else {
                if (!creep.pos.isNearTo(source.pos)) {
                    this.memory.harvesters[creep.memory.s].pid = this.creepActivity.CreateNewCreepActivity({
                        at: AT_MoveToPosition,
                        p: source.pos,
                        a: 1,
                        c: creep.name,
                        HC: 'ConstructContainerActivity'
                    }, this.pid)
                    return;
                }

                let foundSite: ConstructionSite | undefined = undefined;
                let sites = creep.pos.lookFor(LOOK_CONSTRUCTION_SITES);
                if (sites && sites.length > 0) {
                    for (let i = 0; i < sites.length; i++) {
                        if (sites[i].structureType == STRUCTURE_CONTAINER) {
                            foundSite = sites[i];
                            break;
                        }
                    }
                }

                if (!foundSite) {
                    creep.room.createConstructionSite(creep.pos, STRUCTURE_CONTAINER);
                } else {
                    constructionSite = foundSite;
                    this.memory.harvesters[creep.memory.s].sup = foundSite.id;
                }
            }
        }

        if (!constructionSite) {
            this.memory.harvesters[creep.memory.s].pid = this.creepActivity.CreateNewCreepActivity({
                at: AT_Harvest,
                t: creep.memory.s,
                c: creep.name,
                HC: 'ConstructContainerActivity'
            }, this.pid)
            return;
        }
        let actions: SingleCreepActivity_Memory[] = [];
        actions.push({
            at: AT_Harvest,
            t: source.id,
            n: 10
        });
        actions.push({
            at: AT_Build,
            t: constructionSite.id,
            n: 10
        })
        let newMem: RepetitiveCreepActivity_Memory = {
            a: actions,
            c: creep.name,
            HC: 'ConstructContainerActivity'
        }

        this.log.info(`Container construction ${constructionSite.id} in ${creep.room.name} continues.`);
        this.memory.harvesters[creep.memory.s].pid = this.kernel.startProcess(SPKG_RepetitiveCreepActivity, newMem);
        this.kernel.setParent(this.memory.harvesters[creep.memory.s].pid!, this.pid);
    }
}