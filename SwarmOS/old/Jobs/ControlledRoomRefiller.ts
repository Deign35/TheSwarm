export const OSPackage: IPackage<SpawnRegistry_Memory> = {
    install(processRegistry: IProcessRegistry, extensionRegistry: IExtensionRegistry) {
        processRegistry.register(CR_SpawnFill, ControlledRoomRefiller);
    }
}
import { SoloJob } from "./SoloJob";

class ControlledRoomRefiller extends SoloJob<ControlledRoomRefiller_Memory> {
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
        }, this.memory.rID, Priority_High, 1, {
                ct: CT_Refiller,
                lvl: level,
                p: this.pid
            });
        return sID;
    }

    protected CreateCustomCreepActivity(creep: Creep): string | undefined {
        let nextTask = this.GetNewTarget(creep);
        if (!nextTask) {
            return;
        }

        return this.creepActivity.CreateNewCreepActivity({
            t: nextTask.t,
            at: nextTask.a,
            c: creep.name
        }, this.pid);
    }

    protected HandleNoActivity() { }

    protected get energyTargets() {
        return this.roomView.GetRoomData(this.memory.rID)!.targets.CR_SpawnFill!.energy;
    }
    protected get targets() {
        return this.roomView.GetRoomData(this.memory.rID)!.targets.CR_SpawnFill!.targets;
    }

    protected GetNewTarget(creep: Creep): { t: ObjectID, a: ActionType } {
        let actionType: ActionType = AT_NoOp;
        let bestTarget = '';
        let roomData = this.roomView.GetRoomData(creep.room.name)!;
        let energyNeeded = creep.carryCapacity - (creep.carry.energy || 0);
        let carryRatio = creep.carry.energy / creep.carryCapacity;

        let closestDist = 1000;
        if (carryRatio < 0.25) {
            let resources = creep.room.find(FIND_DROPPED_RESOURCES, {
                filter: (resource) => {
                    return resource.resourceType == RESOURCE_ENERGY && resource.amount >= energyNeeded;
                }
            });
            if (resources.length > 0) {
                actionType = AT_Pickup;
                bestTarget = creep.pos.findClosestByRange(resources).id;
            } else {
                let tombstones = creep.room.find(FIND_TOMBSTONES, {
                    filter: (tombstone) => {
                        return tombstone.energy >= energyNeeded;
                    }
                });
                if (tombstones.length > 0) {
                    actionType = AT_Withdraw;
                    bestTarget = creep.pos.findClosestByRange(tombstones).id;
                }
            }
        }

        if (actionType == AT_NoOp && creep.carry.energy > 0) {
            // Find a delivery target
            let targets = this.targets;
            let targetIDs = Object.keys(targets);
            for (let i = 0; i < targetIDs.length; i++) {
                if (bestTarget) {
                    if (targets[targetIDs[i]].p < targets[bestTarget].p) {
                        continue;
                    }
                }
                let nextTarget = Game.getObjectById<ObjectTypeWithID>(targetIDs[i]);
                if (!nextTarget) { continue; }
                let targetWants = 0;
                switch (targets[targetIDs[i]].t) {
                    case (TT_StorageContainer):
                        targetWants = (nextTarget as StructureTerminal).energyCapacity - (nextTarget as StructureContainer).energy;
                        break;
                    case (TT_Creep):
                        targetWants = (nextTarget as Creep).carryCapacity - (nextTarget as Creep).carry.energy;
                        break;
                }

                if (targetWants == 0) {
                    continue;
                }

                if (targetWants > creep.carryCapacity || targetWants <= creep.carry.energy) {
                    let dist = nextTarget.pos.getRangeTo(creep.pos);
                    if (bestTarget && targets[targetIDs[i]].p > targets[bestTarget].p || dist < closestDist) {
                        closestDist = dist;
                        bestTarget = nextTarget.id;
                        actionType = AT_Transfer;
                    }
                }
            }
        }

        if (actionType == AT_NoOp && creep.carry.energy != creep.carryCapacity) {
            // Find a container to withdraw from.
            let targets = this.energyTargets;
            let targetIDs = Object.keys(targets);
            for (let i = 0; i < targetIDs.length; i++) {
                let nextTarget = Game.getObjectById<ObjectTypeWithID>(targetIDs[i]);
                if (!nextTarget) { continue; }

                if (bestTarget) {
                    if (targets[targetIDs[i]].p < targets[bestTarget].p) {
                        continue;
                    }
                }
                let targetHas = 0;
                switch (targets[targetIDs[i]].t) {
                    case (TT_StorageContainer):
                        targetHas = (nextTarget as StructureContainer).energy;
                        break;
                    case (TT_Creep):
                        targetHas = (nextTarget as Creep).carry.energy;
                        break;
                }
                if (targetHas < creep.carryCapacity) {
                    continue;
                }
                if (bestTarget && targets[targetIDs[i]].p > targets[bestTarget].p) {
                    closestDist = nextTarget.pos.getRangeTo(creep.pos);
                    bestTarget = nextTarget.id;
                    if (targets[targetIDs[i]].t == TT_Creep) {
                        actionType = AT_RequestTransfer;
                    } else {
                        actionType = AT_Withdraw;
                    }
                }
                if (targetHas >= creep.carryCapacity - creep.carry.energy) {
                    let dist = nextTarget.pos.getRangeTo(creep.pos);
                    if (dist < closestDist) {
                        closestDist = dist;
                        bestTarget = nextTarget.id;
                        if (targets[targetIDs[i]].t == TT_Creep) {
                            actionType = AT_RequestTransfer;
                        } else {
                            actionType = AT_Withdraw;
                        }
                    }
                }
            }
        }

        return {
            a: actionType,
            t: bestTarget
        }
    }
}