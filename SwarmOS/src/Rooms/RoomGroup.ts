import { BasicProcess, SlimProcess } from "Core/BasicTypes";

export class RoomGroup<T extends RoomGroup_Memory> extends BasicProcess<T> {
    @extensionInterface(EXT_CreepRegistry)
    protected creepRegistry!: ICreepRegistryExtensions;
    @extensionInterface(EXT_RoomView)
    protected View!: IRoomDataExtension;
    @extensionInterface(EXT_CreepActivity)
    protected creepActivity!: ICreepActivityExtensions;

    private _room?: Room;
    protected get room(): Room | undefined {
        return this._room;
    }
    protected get roomName(): RoomID {
        return this.memory.rID;
    }
    protected get roomData(): RoomState {
        return Memory.roomData.roomStateData[this.roomName];
    }

    protected _creepQueue: CreepID[] = [];
    PrepTick() {
        let ids = Object.keys(this.memory.creeps);
        for (let i = 0; i < ids.length; i++) {
            if (!this.memory.creeps[ids[i]].act || !this.kernel.getProcessByPID(this.memory.creeps[ids[i]].act)) {
                this._creepQueue.push(ids[i]);
            }
        }
    }

    RunThread(): ThreadState {
        if (this._creepQueue.length == 0) {
            return ThreadState_Done;
        }

        let creepID = this._creepQueue.shift()!;
        if (this.memory.creeps[creepID].act) {
            this.kernel.killProcess(this.memory.creeps[creepID].act);
        }

        this.creepActivity.CreateNewCreepActivity({
            c: creepID,
            at: AT_Build,
            t: '',
            HC: 'CreepActivityComplete'
        }, this.pid, this.extensions);
        return this._creepQueue.length == 0 ? ThreadState_Done : ThreadState_Active;
    }

    FindTaskForCreep(creep: Creep) {
        let work = creep.getActiveBodyparts(WORK);
        let carry = creep.getActiveBodyparts(CARRY);

        if (work > 0 && carry == 0) {
            // Can harvest or dismantle only
        } else if (work > 0 && carry > 0) {
            // Can build, repair, or upgrade
        } else if (carry > 0) {
            // Can transport and science
        }
    }

    CreepActivityComplete(creepID: CreepID) {
        delete this.memory.creeps[creepID].act;
        this._creepQueue.push(creepID);
        this.sleeper.wake(this.pid);
    }
}