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
        return this.View.GetRoomData(this.memory.rID)!.targets.CR_SpawnFill!.energy;
    }
    protected get targets() {
        return this.View.GetRoomData(this.memory.rID)!.targets.CR_SpawnFill!.targets;
    }

    protected GetNewTarget(creep: Creep): { t: ObjectID, a: ActionType } {
        let actionType: ActionType = AT_NoOp;
        let bestTarget = '';
        let roomData = this.View.GetRoomData(creep.room.name)!;
        let energyNeeded = creep.carryCapacity - (creep.carry.energy || 0);
        let carryRatio = creep.carry.energy / creep.carryCapacity;

        let closestDist = 1000;
        if (carryRatio < 0.25) {
            if (roomData.resources.length > 0) {
                for (let i = 0; i < roomData.resources.length; i++) {
                    let resource = Game.getObjectById<Resource>(roomData.resources[i]);
                    if (resource && (resource.energy || -1) >= energyNeeded) {
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
                    if (tombstone && (tombstone.energy || -1) >= energyNeeded) {
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

        if (actionType == AT_NoOp && creep.carry.energy > 0) {
            // Find a delivery target
            let targets = this.targets;
            let targetIDs = Object.keys(targets);
            for (let i = 0; i < targetIDs.length; i++) {
                if (bestTarget) {
                    if (this.targets[targetIDs[i]].p < this.targets[bestTarget].p) {
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
                    if (dist < closestDist) {
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
                let nexttarget = Game.getObjectById<ObjectTypeWithID>(targetIDs[i]);
                if (!nexttarget) { continue; }
            }
        }

        return {
            a: actionType,
            t: bestTarget
        }
    }
}
