export const OSPackage: IPackage<SpawnRegistry_Memory> = {
    install(processRegistry: IProcessRegistry, extensionRegistry: IExtensionRegistry) {
        processRegistry.register(CJ_Refill, ControlledRoomRefiller);
    }
}
import { SoloJob } from "./SoloJob";

class ControlledRoomRefiller extends SoloJob<ControlledRoomRefiller_Memory> {
    @extensionInterface(EXT_CreepActivity)
    creepActivity!: ICreepActivityExtensions;
    @extensionInterface(EXT_RoomView)
    protected View!: IRoomDataExtension;
    RunThread() {
        let homeRoomData = this.View.GetRoomData(this.memory.rID)!;
        let provider = this.kernel.getProcessByPID(homeRoomData.activityPID);
        if (provider && provider['RoomJobCheckin']) {
            provider['RoomJobCheckin'](this.pkgName);
        }
        return super.RunThread();
    }

    protected GetNewSpawnID(): string {
        let newName = this.memory.rID + '_Ref';
        let level = 1;
        if (this.homeRoom.energyCapacityAvailable >= CreepBodies.Refiller[3].cost) {
            level = 3;
        } else if (this.homeRoom.energyCapacityAvailable >= CreepBodies.Refiller[2].cost) {
            level = 2;
        }

        let sID = this.spawnRegistry.requestSpawn({
            c: CT_Refiller,
            l: level,
            n: newName,
            p: this.pid
        }, this.memory.rID, Priority_Medium, 1, {
                ct: CT_Refiller,
                lvl: level,
                p: this.pid
            });
        return sID;
    }

    protected CreateCustomCreepActivity(creep: Creep): string | undefined {
        let nextTask = this.GetNextTarget(creep);
        if (!nextTask) {
            return;
        }

        return this.creepActivity.CreateNewCreepActivity({
            t: nextTask.t,
            at: nextTask.a,
            c: creep.name
        }, this.pid);
    }

    protected HandleNoActivity() {    }

    protected get energyTargets() {
        return this.View.GetRoomData(this.memory.rID)!.targets.CR_SpawnFill!.energy;
    }
    protected get targets() {
        return this.View.GetRoomData(this.memory.rID)!.targets.CR_SpawnFill!.targets;
    }
    protected GetNextTarget(creep: Creep): { t: ObjectID, a: ActionType } | undefined {
        let actionType: ActionType = AT_NoOp;
        let bestTarget = this.GetBestOfList(creep, this.targets);
        if (bestTarget) {
            actionType = this.targets[bestTarget].a;
        } else {
            bestTarget = this.GetBestOfList(creep, this.energyTargets);
            if (bestTarget) {
                actionType = this.energyTargets[bestTarget].a;
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

    protected GetBestOfList(creep: Creep, list: IDictionary<ObjectID, WorkerTarget_Memory>) {
        let possibleTargets = Object.keys(list);
        let carryRatio = creep.carry.energy / (creep.carryCapacity) || 1;
        let baseScore = creep.carry.energy * carryRatio * 2;

        let scores = {};
        for (let i = 0; i < possibleTargets.length; i++) {
            let id = possibleTargets[i];
            let score = this.ScoreTarget(creep, baseScore, Game.getObjectById(id), list[id]);
            if (score < 0) {
                delete this.targets[id];
            }
            if (score > 0) {
                scores[id] = score;
            }
        }

        let bestTarget: ObjectID | undefined = undefined;
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

        return bestTarget;
    }

    protected ScoreTarget(creep: Creep, baseScore: number, target: ObjectTypeWithID | undefined, targetMemory: WorkerTarget_Memory): number {
        if (!target) {
            return -1;
        }
        let score = baseScore;
        let energyNeeded = 0;

        let distance = creep.pos.getRangeTo(target);
        switch (targetMemory.a) {
            case (AT_Pickup):
                if (targetMemory.t == TT_Resource && (target as Resource).resourceType == RESOURCE_ENERGY) {
                    score = (target as Resource).amount;
                    //score -= distance * Math.ceil((target as Resource).amount / ENERGY_DECAY);
                    if (score >= creep.carryCapacity) {
                        score = creep.carryCapacity * 8;
                    }
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
