export const OSPackage: IPackage<SpawnRegistry_Memory> = {
    install(processRegistry: IProcessRegistry, extensionRegistry: IExtensionRegistry) {
        processRegistry.register(CJ_BootBuild, BootstrapJob);
    }
}

import { FindNextTo, FindStructureNextTo } from "Tools/TheFinder";
import { BasicProcess } from "Core/BasicTypes";

// (TODO): Search for buildings
class BootstrapJob extends BasicProcess<BootstrapBuilder_Memory> {
    @extensionInterface(EXT_CreepActivity)
    protected creepActivity!: ICreepActivityExtensions;
    @extensionInterface(EXT_CreepRegistry)
    creepRegistry!: ICreepRegistryExtensions;
    @extensionInterface(EXT_RoomView)
    protected View!: IRoomDataExtension;

    RunThread(): ThreadState {
        if (!this.memory.bui.a || !this.kernel.getProcessByPID(this.memory.bui.a)) {
            if (this.memory.bui.c) {
                this.CreateBuilderActivity(this.memory.bui.c);
            } else {
                this.CreateBuilderSpawnActivity();
            }
        }

        return ThreadState_Done;
    }

    CreateBuilderSpawnActivity() {
        let sID = this.spawnRegistry.requestSpawn({
            l: 0,
            ct: CT_Worker,
            n: this.memory.rID + '_b'
        }, this.memory.rID, Priority_Low, 1, {
                ct: CT_Worker,
                lvl: 0
            });
        let spawnMem: SpawnActivity_Memory = {
            sID: sID,
            HC: 'CreateBuilderActivity'
        }
        this.memory.bui.a = this.kernel.startProcess(SPKG_SpawnActivity, spawnMem);
        this.kernel.setParent(this.memory.bui.a, this.pid);
    }

    CreateBuilderActivity(creepID: CreepID) {
        this.creepRegistry.tryReserveCreep(creepID, this.pid);
        let creep = this.creepRegistry.tryGetCreep(creepID, this.pid);
        if (!creep) {
            this.CreateBuilderSpawnActivity();
            return;
        }

        this.memory.bui.c = creepID;
        let newActivity: CreepActivity_Memory = {
            at: AT_NoOp as ActionType,
            c: creepID,
            HC: 'CreateBuilderActivity',
            t: '',
            e: [] as ScreepsReturnCode[]
        }

        if (!this.memory.s) {
            newActivity.e = [ERR_NOT_ENOUGH_RESOURCES];
        }
        if (creep.carry.energy == 0 && this.memory.s) {
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
            newActivity.at = AT_Build;
            // find a delivery target
            if (this.memory.sites.length == 0) {
                let sites = creep.room.find(FIND_CONSTRUCTION_SITES);
                for (let i = 0; i < sites.length; i++) {
                    if (sites[i].structureType == STRUCTURE_CONTAINER || sites[i].structureType == STRUCTURE_EXTENSION) {
                        this.memory.sites.push(sites[i].id);
                    }
                }
            }

            while (this.memory.sites.length > 0) {
                let buildTarget = Game.getObjectById(this.memory.sites[0]) as ConstructionSite;
                if (buildTarget && buildTarget.progressTotal) {
                    newActivity.t = buildTarget.id;
                    break;
                } else {
                    this.memory.sites.shift();
                }
            }
            if (!newActivity.t) {
                // if room energy >= 550.  boot complete
                newActivity.at = AT_Upgrade;
                newActivity.t = creep.room.controller!.id
            }
        }
        this.memory.bui.a = this.creepActivity.CreateNewCreepActivity(newActivity, this.pid);
    }
}