export const OSPackage: IPackage<SpawnRegistry_Memory> = {
    install(processRegistry: IProcessRegistry, extensionRegistry: IExtensionRegistry) {
        processRegistry.register(CJ_BootRefill, BootstrapRefiller);
    }
}

import { FindNextTo, FindStructureNextTo } from "Tools/TheFinder";
import { SoloJob } from "./SoloJob";

class BootstrapRefiller extends SoloJob<BootstrapRefiller_Memory> {
    @extensionInterface(EXT_RoomView)
    protected View!: IRoomDataExtension;

    RunThread() {

        let creeps = Game.rooms[this.memory.rID].find(FIND_MY_CREEPS);
        if (creeps.length > 7) {
            this.kernel.killProcess(this.pid);
            return ThreadState_Done;
        }

        for (let i = 0; i < creeps.length; i++) {
            if (creeps[i].memory.ct == CT_Refiller) {
                this.kernel.killProcess(this.pid);
                return ThreadState_Done;
            }
        }

        return super.RunThread();
    }

    GetNewSpawnID() {
        return this.spawnRegistry.requestSpawn({
            l: 0,
            c: CT_Harvester,
            n: this.memory.rID + '_boot',
            p: this.pid
        }, this.memory.rID, Priority_EMERGENCY, 5, {
                ct: CT_Harvester,
                lvl: 0,
                p: this.pid
            });
    }

    CreateCustomCreepActivity(creep: Creep) {
        let newActivity: CreepActivity_Memory = {
            at: AT_NoOp as ActionType,
            c: creep.name,
            e: []
        }
        if (creep.carry.energy == 0) {
            // get energy
            let roomData = this.View.GetRoomData(this.memory.rID)!;
            for (let i = 0; i < roomData.resources.length; i++) {
                let resource = Game.getObjectById<Resource>(roomData.resources[i]);
                if (resource && (resource.energy || 0) >= creep.carryCapacity) {
                    newActivity.at = AT_Pickup;
                    newActivity.t = resource.id;
                    break;
                }
            }
            if (newActivity.at == AT_NoOp) {
                newActivity.at = AT_Harvest;
                let source = creep.pos.findClosestByRange(FIND_SOURCES);
                newActivity.t = source.id;
            }
        } else {
            newActivity.at = AT_Transfer;
            // find a delivery target
            let spawn = creep.room.find(FIND_MY_SPAWNS);
            if (spawn.length > 0 && spawn[0].energy < spawn[0].energyCapacity) {
                newActivity.t = spawn[0].id;
            } else {
                let spawnTainer = FindStructureNextTo(spawn[0].pos, STRUCTURE_CONTAINER, {
                    distance: 3
                });
                if (spawnTainer && spawnTainer.length > 0) {
                    let container = spawnTainer[0].structure as StructureContainer;
                    if (container.energy < container.energyCapacity) {
                        newActivity.t = container.id;
                    }
                }
                if (!newActivity.t) {
                    let extensions = this.View.GetRoomData(this.memory.rID)!.structures.extension;
                    if (extensions && extensions.length > 0) {
                        for (let i = 0; i < extensions.length; i++) {
                            let extension = Game.getObjectById(extensions[i]) as StructureExtension;
                            if (extension && extension.energy < extension.energyCapacity) {
                                newActivity.t = extension.id;
                                break;
                            }
                        }
                    }
                    if (!newActivity.t) {
                        let creeps = creep.room.find(FIND_MY_CREEPS);
                        for (let i = 0; i < creeps.length; i++) {
                            let creep = creeps[i];
                            if (creep.memory.ct == CT_Worker && creep.carry.energy * 5 <= creep.carryCapacity) {
                                newActivity.t = creep.id;
                                break;
                            }
                        }

                        if (!newActivity.t) {
                            let controlTainer = FindStructureNextTo(creep.room.controller!.pos, STRUCTURE_CONTAINER, {
                                distance: 3
                            });
                            if (controlTainer && controlTainer.length > 0) {
                                let container = controlTainer[0].structure as StructureContainer;
                                if (container.energy < container.energyCapacity) {
                                    newActivity.t = container.id;
                                }
                            }
                        }
                    }
                }
            }
        }
        return this.creepActivity.CreateNewCreepActivity(newActivity, this.pid);
    }
}