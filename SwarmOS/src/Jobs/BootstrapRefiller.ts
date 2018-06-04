export const OSPackage: IPackage<SpawnRegistry_Memory> = {
    install(processRegistry: IProcessRegistry, extensionRegistry: IExtensionRegistry) {
        processRegistry.register(CJ_BootRefill, BootstrapJob);
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

    RunThread(): ThreadState {
        if (!this.memory.hb) {
            let terrain = FindNextTo((Game.getObjectById(this.memory.s) as Source).pos, LOOK_TERRAIN);
            let count = 0;
            for (let i = 0; i < terrain.length; i++) {
                if (terrain[i].terrain != 'wall') {
                    count++;
                    this.CreateTempHarvestJob();
                    if (count >= 2) {
                        break;
                    }
                }
            }

            this.memory.hb = true;
        }

        if (!this.memory.ref.a || !this.kernel.getProcessByPID(this.memory.ref.a)) {
            if (this.memory.ref.c) {
                this.CreateRefillActivity(this.memory.ref.c);
            } else {
                this.CreateRefillerSpawnActivity();
            }
        }

        return ThreadState_Done;
    }

    CreateTempHarvestJob() {
        let harvestMem: HarvestJob_Memory = {
            r: this.memory.rID,
            SUPPORT: true,
            t: this.memory.s
        }
        let newPID = this.kernel.startProcess(CJ_Harvest, harvestMem);
        this.kernel.setParent(newPID, this.pid);
        // Will be killed when this process is closed
    }
    CreateTempBuilderJob() {
        let builderMem: BootstrapBuilder_Memory = {
            rID: this.memory.rID,
            bui: {},
            s: this.memory.s,
            sites: []
        }
        let newPID = this.kernel.startProcess(CJ_BootBuild, builderMem);
        this.kernel.setParent(newPID, this.pid);
        // Will be killed when this process is closed
    }

    CreateRefillerSpawnActivity() {
        let sID = this.spawnRegistry.requestSpawn({
            l: 0,
            ct: CT_Worker,
            n: this.memory.s.slice(-5) + 'r'
        }, this.memory.rID, Priority_EMERGENCY, 1, {
                ct: CT_Worker,
                lvl: 0
            });
        let spawnMem: SpawnActivity_Memory = {
            sID: sID,
            HC: 'CreateRefillActivity'
        }
        this.memory.ref.a = this.kernel.startProcess(SPKG_SpawnActivity, spawnMem);
        this.kernel.setParent(this.memory.ref.a, this.pid);
    }

    CreateRefillActivity(creepID: CreepID) {
        this.creepRegistry.tryReserveCreep(creepID, this.pid);
        let creep = this.creepRegistry.tryGetCreep(creepID, this.pid);
        if (!creep) {
            this.CreateRefillerSpawnActivity();
            return;
        }

        this.memory.ref.c = creepID;
        let newActivity = {
            at: AT_NoOp as ActionType,
            c: creepID,
            HC: 'CreateRefillActivity',
            t: '',
            f: []
        }
        if (creep.carry.energy == 0) {
            // get energy
            let resources = FindNextTo((Game.getObjectById(this.memory.s) as Source).pos, LOOK_RESOURCES);
            for (let i = 0; i < resources.length; i++) {
                if (resources[i].resource && (resources[i].resource as Resource).amount > creep.carryCapacity) {
                    newActivity.at = AT_Pickup;
                    newActivity.t = (resources[i].resource as Resource).id;
                }
            }
            if (newActivity.at == AT_NoOp) {
                newActivity.at = AT_Harvest;
                newActivity.t = this.memory.s;
            }
        } else {
            newActivity.at = AT_Transfer;
            // find a delivery target
            let spawn = creep.room.find(FIND_MY_SPAWNS);
            if (spawn.length > 0 && spawn[0].energy < spawn[0].energyCapacity) {
                newActivity.t = spawn[0].id;
            }
            let spawnTainer = FindStructureNextTo(spawn[0].pos, STRUCTURE_CONTAINER, {
                distance: 3
            });
            if (spawnTainer && spawnTainer.length > 0) {
                let container = spawnTainer[0].structure as StructureContainer;
                if (container.energy < container.energyCapacity) {
                    newActivity.t = container.id;
                }
            }
            let controlTainer = FindStructureNextTo(creep.room.controller!.pos, STRUCTURE_CONTAINER, {
                distance: 3
            });
            if (controlTainer && controlTainer.length > 0) {
                let container = controlTainer[0].structure as StructureContainer;
                if (container.energy < container.energyCapacity) {
                    newActivity.t = container.id;
                }
            }
            let creeps = creep.room.find(FIND_MY_CREEPS);
            for (let i = 0; i < creeps.length; i++) {
                let creep = creeps[i];
                if (creep.memory.ct == CT_Worker && creep.carry.energy * 5 <= creep.carryCapacity) {
                    newActivity.t = creep.id;
                }
            }
        }
        this.memory.ref.a = this.creepActivity.CreateNewCreepActivity(newActivity, this.pid, this.extensions);
    }
}