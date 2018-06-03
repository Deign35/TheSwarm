import { BasicProcess } from "Core/BasicTypes";

export abstract class WorkerGroup<T extends WorkerGroup_Memory> extends BasicProcess<T> {
    @extensionInterface(EXT_CreepActivity)
    creepActivity!: ICreepActivityExtensions;
    @extensionInterface(EXT_CreepRegistry)
    creepRegistry!: ICreepRegistryExtensions;
    @extensionInterface(EXT_RoomView)
    View!: IRoomDataExtension;

    abstract GetNextTarget(creep: Creep): { t: ObjectID, a: ActionType } | undefined;

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
            //this.kernel.killProcess(`WorkerGroup tasks complete`);
            return;
        }

        this.creeps[cID].a = this.creepActivity.CreateNewCreepActivity({
            t: nextTask.t,
            at: nextTask.a,
            c: cID,
            f: []
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

    abstract GetSpawnNeeds(): CreepContext | undefined;

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