export const OSPackage: IPackage = {
    install(processRegistry: IProcessRegistry, extensionRegistry: IExtensionRegistry) {
        processRegistry.register(CPKG_ControlledRoomRefiller, ControlledRoomRefiller);
    }
}
import { SoloJob } from "./SoloJob";

class ControlledRoomRefiller extends SoloJob<ControlledRoomRefiller_Memory> {
    RunThread() {
        let creep = Game.creeps[this.memory.creepID!];
        if (creep && !creep.spawning && creep.ticksToLive! < 80) {
            delete this.memory.creepID;
            delete this.memory.activityPID;
        }
        return super.RunThread();
    }

    protected GetNewSpawnID(): string {
        let newName = this.memory.roomID + '_Ref';
        let body = [CARRY, CARRY, MOVE, MOVE];
        if (this.homeRoom.energyCapacityAvailable >= 800) {
            body = [CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE];
        } else if (this.homeRoom.energyCapacityAvailable >= 400) {
            body = [CARRY, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE, MOVE];
        }

        let sID = this.spawnManager.requestSpawn({
            body: body,
            creepName: newName,
            owner_pid: this.pid
        }, this.memory.roomID, Priority_Medium, {
                parentPID: this.pid
            }, 1);
        return sID;
    }

    protected CreateCustomCreepActivity(creep: Creep): string | undefined {
        let nextTask = this.GetNewTarget(creep);
        if (!nextTask) {
            return;
        }

        return this.creepManager.CreateNewCreepActivity({
            targetID: nextTask.t,
            action: nextTask.a,
            creepID: creep.name
        }, this.pid);
    }

    protected HandleNoActivity() { }

    protected GetNewTarget(creep: Creep): { t: ObjectID, a: ActionType } {
        let actionType: ActionType = AT_NoOp;
        let bestTarget = '';
        let roomData = this.roomManager.GetRoomData(creep.room.name)!;
        let energyNeeded = creep.store.getCapacity() - (creep.store[RESOURCE_ENERGY] || 0);
        let carryRatio = creep.store[RESOURCE_ENERGY] / creep.store.getCapacity();

        let closestDist = 1000;
        if (carryRatio < 0.25) {
            if (roomData.resources.length > 0) {
                for (let i = 0; i < roomData.resources.length; i++) {
                    let resource = Game.getObjectById<Resource>(roomData.resources[i]);
                    if (resource && resource.resourceType == RESOURCE_ENERGY && (resource.amount || -1) >= energyNeeded) {
                        let dist = resource.pos.getRangeTo(creep.pos);
                        if (dist < closestDist) {
                            closestDist = dist;
                            bestTarget = resource.id;
                            actionType = AT_Pickup;
                        }
                    }
                }
            }
            if (actionType == AT_NoOp && roomData.tombstones.length > 0) {
                for (let i = 0; i < roomData.tombstones.length; i++) {
                    let tombstone = Game.getObjectById<Tombstone>(roomData.tombstones[i]);
                    if (tombstone && (tombstone.store[RESOURCE_ENERGY] || -1) >= energyNeeded) {
                        let dist = tombstone.pos.getRangeTo(creep.pos);
                        if (dist < closestDist) {
                            closestDist = dist;
                            bestTarget = tombstone.id;
                            actionType = AT_Withdraw;
                        }
                    }
                }
            }
        }

        if (actionType == AT_NoOp && creep.store[RESOURCE_ENERGY] > 0) {
            // Find a delivery target
            let targets = this.roomManager.GetRoomData(this.memory.roomID)!.structures[STRUCTURE_EXTENSION].concat(
                this.roomManager.GetRoomData(this.memory.roomID)!.structures[STRUCTURE_SPAWN]);
            for (let i = 0; i < targets.length; i++) {
                let nextTarget = Game.getObjectById<ObjectTypeWithID>(targets[i]) as StructureExtension | StructureSpawn;
                if (!nextTarget) { continue; }

                let targetWants = nextTarget.store.getFreeCapacity(RESOURCE_ENERGY);
                if (targetWants == 0) {
                    continue;
                }

                if (targetWants > creep.store.getCapacity() || targetWants <= creep.store[RESOURCE_ENERGY]) {
                    let dist = nextTarget.pos.getRangeTo(creep.pos);
                    if (dist < closestDist) {
                        closestDist = dist;
                        bestTarget = nextTarget.id;
                        actionType = AT_Transfer;
                    }
                }
            }
        }

        if (actionType == AT_NoOp && creep.store[RESOURCE_ENERGY] != creep.store.getCapacity()) {
            // Find a container to withdraw from.
            let targets = this.roomManager.GetRoomData(this.memory.roomID)!.structures[STRUCTURE_CONTAINER]
            for (let i = 0; i < targets.length; i++) {
                let nextTarget = Game.getObjectById<ObjectTypeWithID>(targets[i]);
                if (!nextTarget) { continue; }

                let dist = nextTarget.pos.getRangeTo(creep.pos);
                if (dist < closestDist) {
                    closestDist = dist;
                    bestTarget = nextTarget.id;
                    actionType = AT_Withdraw;
                }
            }
        }

        return {
            a: actionType,
            t: bestTarget
        }
    }
}
