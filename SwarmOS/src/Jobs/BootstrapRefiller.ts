export const OSPackage: IPackage<SpawnRegistry_Memory> = {
    install(processRegistry: IProcessRegistry, extensionRegistry: IExtensionRegistry) {
        processRegistry.register(CJ_Boot, BootstrapJob);
    }
}

import { FindNextTo, FindStructureNextTo } from "Tools/TheFinder";
import { BasicProcess } from "Core/BasicTypes";

// (TODO): Search for buildings
class BootstrapJob extends BasicProcess<BootstrapRefiller_Memory> {
    @extensionInterface(EXT_CreepActivity)
    protected creepActivity!: ICreepActivityExtensions;
    @extensionInterface(EXT_CreepRegistry)
    creepRegistry!: ICreepRegistryExtensions;
    @extensionInterface(EXT_RoomView)
    protected View!: IRoomDataExtension;

    get creeps() { return this.memory.creeps; }
    RunThread(): ThreadState {
        if (!this.memory.hb) {
            this.CreateRefillerSpawnActivity();

            let terrain = FindNextTo((Game.getObjectById(this.memory.s) as Source).pos, LOOK_TERRAIN);
            let count = 0;
            for (let i = 0; i < terrain.length; i++) {
                if (terrain[i].terrain != 'wall') {
                    count++;
                    this.CreateHarvestSpawnActivity('S' + i);
                    if (count >= 2) {
                        break;
                    }
                }
            }

            this.memory.hb = true;
            return ThreadState_Done;
        }


        return ThreadState_Done;
    }

    CreateHarvestSpawnActivity(spawnID: string) {
        let sID = this.spawnRegistry.requestSpawn({
            l: 0,
            ct: CT_Harvester,
            n: spawnID
        }, this.memory.rID, Priority_High, 1, {
                ct: CT_Harvester,
                lvl: 0
            });
        let spawnMem: SpawnActivity_Memory = {
            sID: sID,
            HC: 'HarvestSpawnComplete'
        }
        let newPID = this.kernel.startProcess(SPKG_SpawnActivity, spawnMem);
        this.kernel.setParent(newPID, this.pid);
        this.creeps[spawnID].a = newPID;
    }

    HarvestSpawnComplete(creepID: string, activityPID: PID) {
        if (this.creepRegistry.tryReserveCreep(creepID, this.pid)) {
            let creep = this.creepRegistry.tryGetCreep(creepID, this.pid);
            let keys = Object.keys(this.creeps);
            for (let i = 0; i < keys.length; i++) {
                if (this.creeps[keys[i]].a == activityPID) {
                    this.creeps[keys[i]].c = creepID;
                    delete this.creeps[keys[i]].a;
                }
            }
        }
        this.CreateHarvestActivity(creepID);
    }

    CreateHarvestActivity(creepID: string) {
        if (this.creepRegistry.tryReserveCreep(creepID, this.pid)) {
            let newPID = this.creepActivity.CreateNewCreepActivity({
                at: AT_Harvest,
                c: creepID,
                HC: 'HarvestComplete',
                t: this.memory.s
            }, this.pid, this.extensions);
            let keys = Object.keys(this.creeps);
            for (let i = 0; i < keys.length; i++) {
                if (this.creeps[keys[i]].c == creepID) {
                    this.creeps[keys[i]].a = newPID;
                }
            }
        }
    }

    HarvestComplete(creepID: string) {
        let creep = this.creepRegistry.tryGetCreep(creepID);
        if (creep) {
            this.CreateHarvestActivity(creepID);
        } else {
            let keys = Object.keys(this.creeps);
            for (let i = 0; i < keys.length; i++) {
                if (this.creeps[keys[i]].c == creepID) {
                    this.CreateHarvestSpawnActivity(keys[i]);
                    break;
                }
            }
        }
    }

    CreateRefillerSpawnActivity() {
        let sID = this.spawnRegistry.requestSpawn({
            l: 0,
            ct: CT_Harvester,
            n: this.memory.s.slice(-5) + 'ref'
        }, this.memory.rID, Priority_EMERGENCY, 1, {
                ct: CT_Harvester,
                lvl: 0
            });
        let spawnMem: SpawnActivity_Memory = {
            sID: sID,
            HC: 'RefillerSpawnComplete'
        }
        let newPID = this.kernel.startProcess(SPKG_SpawnActivity, spawnMem);
        this.kernel.setParent(newPID, this.pid);
        this.creeps['refill'].a = newPID;
    }

    RefillerSpawnComplete(creepID: CreepID) {
        if (this.creepRegistry.tryReserveCreep(creepID, this.pid)) {
            let creep = this.creepRegistry.tryGetCreep(creepID, this.pid);
            this.creeps['refill'].c = creepID;
        }
    }

    CreateRefillActivity(creepID: CreepID) {
        if (this.creepRegistry.tryReserveCreep(creepID, this.pid)) {
            let creep = this.creepRegistry.tryGetCreep(creepID, this.pid);
            if (!creep) {
                delete this.memory.creeps['refill'].c;
                this.CreateRefillerSpawnActivity();
                return;
            }

            if (creep.carry.energy == 0) {
                // get energy
                let resources = FindNextTo((Game.getObjectById(this.memory.s) as Source).pos, LOOK_RESOURCES);
                for (let i = 0; i < resources.length; i++) {
                    if (resources[i].resource && (resources[i].resource as Resource).amount > creep.carryCapacity) {
                        this.creeps['refill'].a = this.creepActivity.CreateNewCreepActivity({
                            at: AT_Pickup,
                            c: creepID,
                            t: (resources[i].resource as Resource).id
                        }, this.pid, this.extensions);
                        return;
                    }
                }
            } else {
                // find a delivery target
                let spawn = creep.room.find(FIND_MY_SPAWNS);
                if (spawn.length > 0 && spawn[0].energy < spawn[0].energyCapacity) {
                    this.creeps['refill'].a = this.creepActivity.CreateNewCreepActivity({
                        at: AT_Transfer,
                        c: creepID,
                        t: spawn[0].id
                    }, this.pid, this.extensions);
                    return;
                }
                let spawnTainer = FindStructureNextTo(spawn[0].pos, STRUCTURE_CONTAINER, {
                    distance: 3
                });
                if (spawnTainer && spawnTainer.length > 0) {
                    let container = spawnTainer[0].structure as StructureContainer;
                    if (container.energy < container.energyCapacity) {
                        this.creeps['refill'].a = this.creepActivity.CreateNewCreepActivity({
                            at: AT_Transfer,
                            c: creepID,
                            t: container.id
                        }, this.pid, this.extensions);
                        return;
                    }
                }
                let controlTainer = FindStructureNextTo(creep.room.controller!.pos, STRUCTURE_CONTAINER, {
                    distance: 3
                });
                if (controlTainer && controlTainer.length > 0) {
                    let container = controlTainer[0].structure as StructureContainer;
                    if (container.energy < container.energyCapacity) {
                        this.creeps['refill'].a = this.creepActivity.CreateNewCreepActivity({
                            at: AT_Transfer,
                            c: creepID,
                            t: container.id
                        }, this.pid, this.extensions);
                        return;
                    }
                }
                let creeps = creep.room.find(FIND_MY_CREEPS);
                for (let i = 0; i < creeps.length; i++) {
                    let creep = creeps[i];
                    if (creep.memory.ct == CT_Worker && creep.carry.energy == 0) {
                        this.creeps['refill'].a = this.creepActivity.CreateNewCreepActivity({
                            at: AT_Transfer,
                            c: creepID,
                            t: creep.id
                        }, this.pid, this.extensions);
                        return;
                    }
                }
            }
        }
    }
}