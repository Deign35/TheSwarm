export const OSPackage: IPackage<SpawnRegistry_Memory> = {
    install(processRegistry: IProcessRegistry, extensionRegistry: IExtensionRegistry) {
        processRegistry.register(RJ_Harvest, RoomStateHarvestActivity);
    }
}

import { FindNextTo, FindStructureNextTo } from "Tools/TheFinder";
import { RoomMonitorBase } from "./RoomMonitors";

class RoomStateHarvestActivity extends RoomMonitorBase<RoomStateHarvest_Memory> {
    MonitorRoom(): ThreadState {
        if (this.roomData.RoomType.type != RT_Home && this.roomData.RoomType.type != RT_RemoteHarvest) {
            return ThreadState_Done;
        }
        if (this.memory.nb) {
            this.BootHarvest();
        }
        let keys = Object.keys(this.memory.harvesters);
        for (let i = 0; i < keys.length; i++) {
            let mem = this.memory.harvesters[keys[i]];
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

                    if (mem.sup) {
                        // (TODO): inform the harvester
                    }
                }
            }

            if (!mem.pid || !this.kernel.getProcessByPID(mem.pid!)) {
                this.SpawnHarvester(keys[i], mem.sup);
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

    SpawnHarvester(sourceID: ObjectID, supportStructure?: ObjectID) {
        this.log.info(`Spawning a harvester for ${sourceID}.`);
        let spawnLevel = 0;
        if (this.roomData.RoomType.type == RT_RemoteHarvest) { // Remote harvester
            spawnLevel = 2;
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

                    // Spawns a support harvester if there's a total of 2 spaces next to the source.
                    // Spawns 2 support harvesters if there's a total of 3 spaces next to the source.
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
        let harvMem: HarvesterMemory = {
            src: sourceID,
            supStr: supportStructure,
            helper: false,
            home: this.memory.hr,
            rID: this.memory.rID,
            spLvl: spawnLevel,
            exp: true
        }

        this.memory.harvesters[sourceID].pid = this.kernel.startProcess(CR_Harvester, harvMem);
        this.kernel.setParent(this.memory.harvesters[sourceID].pid!, this.pid);
    }

    SpawnSupport(sourceID: ObjectID) {
        let harvMem: HarvesterMemory = {
            src: sourceID,
            helper: true,
            home: this.memory.hr,
            rID: this.memory.rID,
            spLvl: 0,
            exp: true
        }
        let newPID = this.kernel.startProcess(CR_Harvester, harvMem);
        this.kernel.setParent(newPID, this.pid);
    }
}