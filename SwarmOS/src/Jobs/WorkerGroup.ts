export const OSPackage: IPackage<SpawnRegistry_Memory> = {
    install(processRegistry: IProcessRegistry, extensionRegistry: IExtensionRegistry) {
        processRegistry.register(CG_Worker, WorkerGroup);
    }
}
import { BasicProcess } from "Core/BasicTypes";

class WorkerGroup extends BasicProcess<WorkerGroup_Memory> {
    @extensionInterface(EXT_CreepActivity)
    creepActivity!: ICreepActivityExtensions;
    @extensionInterface(EXT_CreepRegistry)
    creepRegistry!: ICreepRegistryExtensions;
    @extensionInterface(EXT_RoomView)
    View!: IRoomDataExtension;

    get creeps() { return this.memory.creeps; }
    get energyTargets() { return this.memory.energy; }
    get room(): Room | undefined { return Game.rooms[this.memory.rID] };
    get roomData() { return this.View.GetRoomData(this.memory.rID); }
    get targets() { return this.memory.targets; }

    RunThread(): ThreadState {
        // Scale the number of creeps needed based on energy allocation and available energy.
        let cIDs = Object.keys(this.creeps);
        for (let i = 0; i < cIDs.length; i++) {
            if (!this.creeps[cIDs[i]].a || !this.kernel.getProcessByPID(this.creeps[cIDs[i]].a!)) {
                // Create a new activity for the creep.
                if (!this.creepRegistry.tryReserveCreep(cIDs[i], this.pid)) {
                    delete this.creeps[cIDs[i]];
                    continue;
                }
                this.CreateActivityForCreep(cIDs[i]);
            }
        }
        return ThreadState_Done;
    }

    CreateActivityForCreep(cID: CreepID) {
        let creep = this.creepRegistry.tryGetCreep(cID, this.pid);
        if (!creep) {
            // (TODO): This needs to be changed for sure!  Either do a respawn or somethign...
            delete this.creeps[cID];
            return;
        }
        let nextTask = this.GetBestTargetForCreep(creep);
        if (!nextTask) {
            this.kernel.killProcess(`WorkerGroup tasks complete`);
            return;
        }

        this.creeps[cID].a = this.creepActivity.CreateNewCreepActivity({
            t: nextTask.t,
            at: nextTask.a,
            c: cID,
        }, this.pid, this.extensions);
    }

    ActivityComplete(cID: CreepID) {
        let creep = this.creepRegistry.tryGetCreep(cID);
        if (creep) {
            // Create a new activity for the creep to either use the energy it has or to get more energy.
            this.CreateActivityForCreep(cID);
        } else {
            delete this.memory.creeps[cID];
        }
    }

    GetBestTargetForCreep(creep: Creep): { t: ObjectID, a: ActionType } | undefined {
        let possibleTargets = Object.keys(this.targets);
        let scores = {};
        for (let i = 0; i < possibleTargets.length; i++) {
            let id = possibleTargets[i];
            scores[id] = this.ScoreTarget(creep, Game.getObjectById(id), this.targets[id]);
            if (scores[id] < 0) {
                delete this.targets[id];
            }
            if (scores[id] <= 0) {
                delete scores[id];
                continue;
            }
        }
        let bestTarget: ObjectID | undefined = undefined;
        let actionType: ActionType = AT_NoOp;
        possibleTargets = Object.keys(scores);
        for (let i = 0; i < possibleTargets.length; i++) {
            let score = scores[possibleTargets[i]] || 0;
            if (score > 0) {
                if (!bestTarget) {
                    bestTarget = possibleTargets[i];
                } else if (score > scores[bestTarget]) {
                    bestTarget = possibleTargets[i];
                }
            }
        }
        if (!bestTarget) {
            // get energy targets
            let eIDs = Object.keys(this.energyTargets);
            scores = {};
            for (let i = 0; i < eIDs.length; i++) {
                let id = eIDs[i];
                scores[id] = this.ScoreTarget(creep, Game.getObjectById(id), this.energyTargets[id]);
                if (scores[id] < 0) {
                    delete this.energyTargets[id];
                }
                if (scores[id] <= 0) {
                    delete scores[id];
                    continue;
                }
            }

            eIDs = Object.keys(scores);
            for (let i = 0; i < eIDs.length; i++) {
                let score = scores[eIDs[i]] || 0;
                if (score > 0) {
                    if (!bestTarget) {
                        bestTarget = eIDs[i];
                    } else if (score > scores[bestTarget]) {
                        bestTarget = eIDs[i];
                    }
                }
            }
            if (!!bestTarget) {
                actionType = this.energyTargets[bestTarget].a;
            }
        }

        if (!bestTarget) {
            return undefined;
        }
        return {
            t: bestTarget,
            a: actionType
        }
    }

    ScoreTarget(creep: Creep, target: ObjectTypeWithID | undefined, targetMemory: WorkerTarget_Memory): number {
        if (!target) {
            return -1;
        }
        let creepEnergy = creep.carry.energy;
        let creepRatio = creepEnergy / (creep.carryCapacity) || 1;
        let score = creepEnergy * creepRatio * 2;
        let energyNeeded = 0;

        let distance = creep.pos.getRangeTo(target);

        if (targetMemory.t == TT_ConstructionSite && targetMemory.a == AT_Build) {
            energyNeeded = (target as ConstructionSite).progressTotal - (target as ConstructionSite).progress;
        } else if (targetMemory.t == TT_StorageContainer) {
            if (targetMemory.a == AT_Withdraw) {
                score = Math.min((target as StructureContainer).energy || 0, creep.carryCapacity);
            } else if (targetMemory.a == AT_Transfer) {
                energyNeeded = (target as StructureStorage).energyCapacity - (target as StructureLink).energy;
            }
        } else if (targetMemory.t == TT_AnyStructure && targetMemory.a == AT_Repair) {
            energyNeeded = ((target as Structure).hitsMax - (target as Structure).hits) * REPAIR_COST;
        } else if (targetMemory.t == TT_Controller) {
            energyNeeded = 1;
        } else if (targetMemory.t == TT_Resource && targetMemory.a == AT_Pickup && (target as Resource).resourceType == RESOURCE_ENERGY) {
            score = (target as Resource).amount;
            score -= distance * Math.ceil((target as Resource).amount / ENERGY_DECAY);
            if (score > energyNeeded) {
                score *= 4;
            }
        } else if (targetMemory.t == TT_Creep) {
            if (targetMemory.a == AT_RequestTransfer) {
                score = (target as Creep).carry.energy;
                if (score > energyNeeded) {
                    score *= 2;
                }
            } else if (targetMemory.a == AT_Transfer) {
                score = (target as Creep).carryCapacity - (target as Creep).carry.energy;
            }
        }

        if (creepEnergy >= energyNeeded) {
            score *= 4;
        } else if (creep.carryCapacity >= energyNeeded) {
            score = 0;
        }

        score = (Math.pow(0.9, creep.pos.getRangeTo(target)) * score); // Further away = lower score by 10% per distance
        score = (Math.pow(1.2, targetMemory.p) * score); // Higher priority = higher score by 20% per priority level

        return score;
    }

    AddCreep(creepID: CreepID) {
        if (this.creepRegistry.tryReserveCreep(creepID, this.pid)) {
            this.creeps[creepID] = {};
            this.CreateActivityForCreep(creepID);
        }
    }

    RemoveCreep(creepID: CreepID) {
        if (this.creeps[creepID]) {
            if (this.creeps[creepID].a) {
                this.kernel.killProcess(this.creeps[creepID].a!);
            }
            delete this.creeps[creepID];
        }
    }
}