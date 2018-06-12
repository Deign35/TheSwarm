export const OSPackage: IPackage<SpawnRegistry_Memory> = {
    install(processRegistry: IProcessRegistry, extensionRegistry: IExtensionRegistry) {
        processRegistry.register(CJ_Work, WorkerGroup);
    }
}

import { BasicProcess } from "Core/BasicTypes";

export class WorkerGroup extends BasicProcess<WorkerGroup_Memory> implements IWorkerGroupProcess {
    @extensionInterface(EXT_CreepActivity)
    creepActivity!: ICreepActivityExtensions;
    @extensionInterface(EXT_CreepRegistry)
    creepRegistry!: ICreepRegistryExtensions;
    @extensionInterface(EXT_RoomView)
    View!: IRoomDataExtension;

    get creeps() { return this.memory.creeps; }
    get room(): Room | undefined { return Game.rooms[this.memory.rID] };
    get roomData() { return this.View.GetRoomData(this.memory.rID); }

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
            delete this.creeps[cID];
            return;
        }
        let nextTask = this.GetNextTarget(creep);
        if (!nextTask) {
            return;
        }

        this.creeps[cID].a = this.creepActivity.CreateNewCreepActivity({
            t: nextTask.t,
            at: nextTask.a,
            c: cID
        }, this.pid);
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

    get targets() { return this.View.GetRoomData(this.memory.rID)!.targets.CR_Work!.targets; }
    get energyTargets() { return this.View.GetRoomData(this.memory.rID)!.targets.CR_Work!.energy; }

    GetNextTarget(creep: Creep): { t: ObjectID, a: ActionType } | undefined {
        let actionType: ActionType = AT_NoOp;
        let bestTarget = this.GetBestOfList(creep, this.targets);
        if (bestTarget) {
            actionType = this.targets[bestTarget].a;
        } else {
            let pickupTargets = this.View.GetRoomData(this.memory.rID)!.resources.concat(this.View.GetRoomData(this.memory.rID)!.tombstones);
            let eligibleTargets: WorkerTargetDictionary = {};
            for (let i = 0; i < pickupTargets.length; i++) {
                let res = Game.getObjectById(pickupTargets[i]) as Resource | Tombstone;
                if (res && (res as Resource).resourceType == RESOURCE_ENERGY) {
                    if ((res as Resource).amount >= creep.carryCapacity) {
                        eligibleTargets[res.id] = {
                            a: AT_Pickup,
                            p: Priority_Medium,
                            t: TT_Resource
                        };
                    }
                } else if (res && (res as Tombstone).deathTime) {
                    if ((res as Tombstone).energy >= creep.carryCapacity) {
                        eligibleTargets[res.id] = {
                            a: AT_Withdraw,
                            p: Priority_Medium,
                            t: TT_StorageContainer
                        };
                    }
                }
            }
            bestTarget = this.GetBestOfList(creep, eligibleTargets);
            if (bestTarget) {
                actionType = eligibleTargets[bestTarget].a;
            } else {
                bestTarget = this.GetBestOfList(creep, this.energyTargets);
                if (bestTarget) {
                    actionType = this.energyTargets[bestTarget].a;
                }
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

    GetBestOfList(creep: Creep, list: IDictionary<ObjectID, WorkerTarget_Memory>) {
        let possibleTargets = Object.keys(list);
        let carryRatio = creep.carry.energy / (creep.carryCapacity) || 1;
        let baseScore = creep.carry.energy * carryRatio * 2;

        let bestScore = 0;
        let bestID: ObjectID | undefined = undefined;
        for (let i = 0; i < possibleTargets.length; i++) {
            let id = possibleTargets[i];
            let score = this.ScoreTarget(creep, baseScore, Game.getObjectById(id), list[id]);
            if (score < 0) {
                delete this.targets[id];
            }
            if (score > bestScore) {
                bestScore = score;
                bestID = id;
            }
        }

        return bestID;
    }

    // (TODO): Scoring needs to be more dynamic, especially for construction.  Use energyNeeded as the primary means of driving that.
    ScoreTarget(creep: Creep, baseScore: number, target: ObjectTypeWithID | undefined, targetMemory: WorkerTarget_Memory): number {
        if (!target) {
            return -1;
        }
        let score = baseScore;
        let energyNeeded = 0;

        let distance = creep.pos.getRangeTo(target);
        switch (targetMemory.a) {
            case (AT_Build):
                if (targetMemory.t == TT_ConstructionSite) {
                    energyNeeded = (target as ConstructionSite).progressTotal - (target as ConstructionSite).progress;
                }
                break;
            case (AT_Pickup):
                if (targetMemory.t == TT_Resource && (target as Resource).resourceType == RESOURCE_ENERGY) {
                    score = (target as Resource).amount;
                    //score -= distance * Math.ceil((target as Resource).amount / ENERGY_DECAY);
                    if (score >= creep.carryCapacity) {
                        score = creep.carryCapacity * 8;
                    }
                }
                break;
            case (AT_Repair):
                if (targetMemory.t == TT_AnyStructure) {
                    energyNeeded = ((target as Structure).hitsMax - (target as Structure).hits) * REPAIR_COST;
                }
                break;
            case (AT_RequestTransfer):
                score = (target as Creep).carry.energy;
                if (score >= creep.carryCapacity) {
                    score = creep.carryCapacity * 4;
                }
                break;
            case (AT_Transfer):
                score = baseScore;
                if (targetMemory.t == TT_StorageContainer) {
                    energyNeeded = (target as StructureStorage).energyCapacity - (target as StructureLink).energy;
                } else if (targetMemory.t == TT_Creep) {
                    energyNeeded = (target as Creep).carryCapacity - (target as Creep).carry.energy;
                }

                if (energyNeeded == 0) {
                    return 0;
                }
                break;
            case (AT_Upgrade):
                energyNeeded = creep.carryCapacity + 1;
                break;
            case (AT_Withdraw):
                if (targetMemory.t == TT_StorageContainer) {
                    score = (target as StructureContainer).energy;
                    if (score >= creep.carryCapacity) {
                        score = creep.carryCapacity;
                    }
                }
                break;
            default:
                score = 0;
                break;
        }

        if (energyNeeded > 0) {
            if (creep.carry.energy >= energyNeeded) {
                score *= 4;
            } else if (creep.carryCapacity >= energyNeeded) {
                score = 0;
            }
            score *= Math.pow(0.9, distance); // Further away = lower score by 10% per distance
        } else {
            score *= Math.pow(1.1, distance); // Closer withdraw targets get higher score
        }

        return (Math.pow(1.2, targetMemory.p) * score);// Higher priority = higher score by 20% per priority level
    }
}