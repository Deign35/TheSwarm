export const OSPackage: IPackage<SpawnRegistry_Memory> = {
    install(processRegistry: IProcessRegistry, extensionRegistry: IExtensionRegistry) {
        processRegistry.register(CG_Refill, RefillGroup);
    }
}

import { BasicCreepGroup } from "Groups/BasicCreepGroup";

class RefillGroup extends BasicCreepGroup<RefillGroup_Memory> {
    protected get creepTargets() {
        this.memory.creeps = this.memory.creeps || [];
        return this.memory.creeps;
    }
    protected get structTargets() {
        this.memory.structs = this.memory.structs || [];
        return this.memory.structs;
    }
    GetAssignmentTarget(aID: string) {
        if (this.creepTargets.length == 0 && this.structTargets.length == 0) {
            let viewData = this.View.GetRoomData(this.memory.targetRoom)!;
            if (!viewData) {
                return undefined;
            }

            if (viewData.structures.tower) {
                for (let i = 0; i < viewData.structures.tower.length; i++) {
                    let tower = Game.getObjectById(viewData.structures.tower[i]) as StructureTower;
                    if (tower) {
                        this.structTargets.push(tower.id);
                    }
                }
            }

            let ids = Object.keys(Game.creeps);
            for (let i = 0; i < ids.length; i++) {
                let creep = Game.creeps[ids[i]];
                if (creep.memory.ct == CT_Worker && creep.carry.energy * 2 < creep.carryCapacity) {
                    this.creepTargets.push(creep.id);
                }
            }
            if (viewData.structures.extension) {
                // SupportFiller will help out with spawn filling if no other work is nearby
                for (let i = 0; i < viewData.structures.extension.length; i++) {
                    let extension = Game.getObjectById(viewData.structures.extension[i]) as StructureExtension;
                    if (extension) {
                        this.structTargets.push(extension.id);
                    }
                }
            }
            if (viewData.structures.spawn) {
                for (let i = 0; i < viewData.structures.spawn.length; i++) {
                    let spawn = Game.getObjectById(viewData.structures.spawn[i]) as StructureSpawn;
                    if (spawn && spawn.energy < spawn.energyCapacity) {
                        this.structTargets.push(spawn.id);
                    }
                }
            }
            if (this.structTargets.length == 0 && viewData.structures.storage) {
                this.structTargets.push(viewData.structures.storage);
            }

        }

        let retVal = undefined;
        if (this.structTargets.length > 0) {
            retVal = this.structTargets.shift();
        } else if (this.creepTargets.length > 0) {
            retVal = this.creepTargets.shift();
        }

        return retVal;
    }
    protected EnsureGroupFormation(): void {
        let viewData = this.View.GetRoomData(this.memory.targetRoom)!;
        let targetRoom = Game.rooms[this.memory.targetRoom];

        let isMyRoom = viewData.owner && viewData.owner == MY_USERNAME;
        let spawnCap = 300;
        if (!viewData.owner) {
            let room = Game.rooms[this.memory.homeRoom];
            spawnCap = room.energyCapacityAvailable;
        } else {
            spawnCap = targetRoom.energyCapacityAvailable;
        }

        if (isMyRoom) {
            if (targetRoom.controller!.level <= 3) {
                this.EnsureAssignment('EMRefiller', CT_Worker, 0, Priority_EMERGENCY, CJ_Refiller, TT_SpawnRefill);
                this.EnsureAssignment('SupportFiller3', CT_SlowHauler, spawnCap >= CreepBodies.SlowHauler[1].cost ? 1 : 0, Priority_Lowest, CJ_Refiller, TT_SupportFiller);
                this.EnsureAssignment('SupportFiller4', CT_SlowHauler, spawnCap >= CreepBodies.SlowHauler[1].cost ? 1 : 0, Priority_Lowest, CJ_Refiller, TT_SupportFiller);
            }
            this.EnsureAssignment('SpawnFiller', CT_FastHauler, spawnCap >= CreepBodies.FastHauler[2].cost ? 2 : 1, Priority_High, CJ_Refiller, TT_SpawnRefill);
            this.EnsureAssignment('SupportFiller', CT_SlowHauler, spawnCap >= CreepBodies.SlowHauler[1].cost ? 1 : 0, Priority_Low, CJ_Refiller, TT_SupportFiller);
            this.EnsureAssignment('SupportFiller2', CT_FastHauler, spawnCap >= CreepBodies.FastHauler[2].cost ? 2 : 1, Priority_Low, CJ_Refiller, TT_SupportFiller);
        }
    }
}