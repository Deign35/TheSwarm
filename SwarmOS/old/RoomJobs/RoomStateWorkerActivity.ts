export const OSPackage: IPackage<SpawnRegistry_Memory> = {
    install(processRegistry: IProcessRegistry, extensionRegistry: IExtensionRegistry) {
        processRegistry.register(RJ_WorkTarget, RoomStateWorkerTargetActivity);
    }
}
import { RoomMonitorBase } from "./RoomMonitors";

class RoomStateWorkerTargetActivity extends RoomMonitorBase<RoomStateWorkTarget_Memory> {
    protected get refreshFrequency() { return 1; }
    PrepTick() {
        super.PrepTick();
        this.roomData.targets.Other = {
            t: TT_None,
            en: 0,
            at: AT_NoOp,
            target: ''
        }
        if (this.room) {
            if (this.shouldRefresh(17, this.memory.luCS)) {
                this.memory.cSites = this.room.find(FIND_CONSTRUCTION_SITES).map((value: ConstructionSite) => {
                    return value.id;
                });
                this.memory.luCS = Game.time;
            }
            if (this.shouldRefresh(27, this.memory.luRE)) {
                let curEnergyLevel = 0;
                this.roomData.targets.CR_Work.energy = {};
                for (let i = 0; i < this.roomData.structures.container.length; i++) {
                    let containerID = this.roomData.structures.container[i];
                    let container = Game.getObjectById(containerID) as StructureContainer;
                    if (!container) { continue; }
                    curEnergyLevel += container.energy || 0;

                    if (!this.roomData.targets.CR_SpawnFill.energy[containerID]) {
                        this.roomData.targets.CR_SpawnFill.energy[containerID] = {
                            a: AT_Withdraw,
                            p: Priority_Lowest,
                            t: TT_StorageContainer
                        }
                    }
                    if (!this.roomData.targets.CR_Work.energy[containerID]) {
                        this.roomData.targets.CR_Work.energy[containerID] = {
                            a: AT_Withdraw,
                            p: Priority_Lowest,
                            t: TT_StorageContainer
                        }
                    }

                    let sources = container.pos.findInRange(FIND_SOURCES, 1);
                    if (sources && sources.length > 0) {
                        this.roomData.targets.CR_SpawnFill.energy[containerID].p = Priority_Low
                    } else {
                        if (!this.roomData.targets.CR_SpawnFill.targets[containerID]) {
                            this.roomData.targets.CR_SpawnFill.targets[containerID] = {
                                a: AT_Transfer,
                                p: Priority_Low,
                                t: TT_StorageContainer
                            }
                        }
                        this.roomData.targets.CR_Work.energy[containerID].p = Priority_High;
                    }
                }

                if (this.roomData.structures.spawn) {
                    for (let i = 0; i < this.roomData.structures.spawn.length; i++) {
                        let spawnID = this.roomData.structures.spawn[i];
                        if (!this.roomData.targets.CR_SpawnFill.targets[spawnID]) {
                            this.roomData.targets.CR_SpawnFill.targets[spawnID] = {
                                a: AT_Transfer,
                                p: Priority_High,
                                t: TT_StorageContainer
                            }
                        }
                    }
                }

                if (this.roomData.structures.extension) {
                    for (let i = 0; i < this.roomData.structures.extension.length; i++) {
                        let extensionID = this.roomData.structures.extension[i];
                        if (!this.roomData.targets.CR_SpawnFill.targets[extensionID]) {
                            this.roomData.targets.CR_SpawnFill.targets[extensionID] = {
                                a: AT_Transfer,
                                p: Priority_Highest,
                                t: TT_StorageContainer
                            }
                        }
                    }
                }

                if (this.room && this.room.storage) {
                    curEnergyLevel += this.room.storage.energy;
                    if (!this.roomData.targets.CR_SpawnFill.targets[this.room.storage.id]) {
                        this.roomData.targets.CR_SpawnFill.targets[this.room.storage.id] = {
                            a: AT_Transfer,
                            p: Priority_Lowest,
                            t: TT_StorageContainer
                        }
                    }
                    if (!this.roomData.targets.CR_Work.energy[this.room.storage.id]) {
                        this.roomData.targets.CR_Work.energy[this.room.storage.id] = {
                            a: AT_Withdraw,
                            p: Priority_Lowest,
                            t: TT_StorageContainer
                        }
                    }
                }

                if (this.roomData.structures.tower && this.roomData.structures.tower.length > 0) {
                    for (let i = 0; i < this.roomData.structures.tower.length; i++) {
                        if (!this.roomData.targets.CR_SpawnFill.targets[this.roomData.structures.tower[i]]) {
                            this.roomData.targets.CR_SpawnFill.targets[this.roomData.structures.tower[i]] = {
                                a: AT_Transfer,
                                p: Priority_Medium,
                                t: TT_StorageContainer
                            }
                        }
                    }
                }

                let creeps = this.room.find(FIND_MY_CREEPS);
                for (let i = 0; i < creeps.length; i++) {
                    if (creeps[i].memory.ct == CT_Worker) {
                        this.roomData.targets.CR_SpawnFill.targets[creeps[i].id] = {
                            a: AT_Transfer,
                            p: Priority_Lowest,
                            t: TT_Creep
                        }
                    }
                }

                this.memory.luRE = Game.time;
            }
        }

        if (this.room && this.roomData.owner == MY_USERNAME) {
            if (this.room.controller!.ticksToDowngrade < 2000) {
                this.roomData.targets.Other = {
                    target: this.room.controller!.id,
                    at: AT_Upgrade,
                    t: TT_Controller,
                    en: 200
                }
            }
        }
    }
    MonitorRoom(): ThreadState {
        if (!this.room) {
            return ThreadState_Done;
        }
        let curTarget = Game.getObjectById(this.roomData.targets.Other.target);
        if (curTarget && this.roomData.targets.Other.en > 0 && this.roomData.targets.Other.t != TT_None &&
            this.roomData.targets.Other.at != AT_NoOp) {
            return ThreadState_Done;
        }
        if (!curTarget) {
            this.roomData.targets.Other = {
                target: '',
                at: AT_NoOp,
                t: TT_None,
                en: 0
            }
        }

        if (this.roomData.targets.Other.t != TT_AnyStructure) {
            while (this.memory.needsRepair.length > 0) {
                let nextTarget = Game.getObjectById<Structure>(this.memory.needsRepair.splice(0, 1)![0]);
                if (nextTarget && nextTarget != curTarget) {
                    this.roomData.targets.Other = {
                        t: TT_AnyStructure,
                        at: AT_Repair,
                        target: nextTarget.id,
                        en: Math.ceil((nextTarget.hitsMax - nextTarget.hits) * REPAIR_COST)
                    }
                    return ThreadState_Waiting;
                }
            }
        }

        let nextTarget;
        if (!nextTarget && this.roomData.targets.Other.t != TT_ConstructionSite && this.memory.cSites.length > 0) {
            let siteToBuild: ConstructionSite | undefined = undefined;
            // (TODO): Prioritize here.
            for (let i = 0; i < this.memory.cSites.length; i++) {
                let site = Game.getObjectById<ConstructionSite>(this.memory.cSites[i]);
                if (site && site != curTarget) {
                    if (site.structureType == STRUCTURE_EXTENSION || site.structureType == STRUCTURE_SPAWN) {
                        siteToBuild = site;
                        break;
                    }

                    if (!siteToBuild) {
                        siteToBuild = site;
                        continue;
                    }
                    if (siteToBuild.structureType != STRUCTURE_CONTAINER && site.structureType == STRUCTURE_CONTAINER) {
                        siteToBuild = site;
                    }
                }
            }

            if (siteToBuild) {
                this.roomData.targets.Other = {
                    target: siteToBuild.id,
                    at: AT_Build,
                    t: TT_ConstructionSite,
                    en: Math.ceil((siteToBuild.progressTotal - siteToBuild.progress) / BUILD_POWER)
                }
                nextTarget = siteToBuild;
                return ThreadState_Waiting;
            }
        }

        if (this.roomData.owner == MY_USERNAME) {
            this.roomData.targets.Other = {
                target: this.room.controller!.id,
                at: AT_Upgrade,
                t: TT_Controller,
                en: 200
            }
            return ThreadState_Waiting;
        }

        this.roomData.targets.Other = {
            target: '',
            at: AT_NoOp,
            t: TT_None,
            en: 0
        }
        return ThreadState_Done;
    }
}