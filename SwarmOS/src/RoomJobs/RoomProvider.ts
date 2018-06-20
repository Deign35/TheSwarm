export const OSPackage: IPackage<RoomStateMemory> = {
    install(processRegistry: IProcessRegistry, extensionRegistry: IExtensionRegistry) {
        processRegistry.register(SPKG_RoomActivity, RoomProvider);
    }
}

import { PackageProviderBase, BasicProcess } from "Core/BasicTypes";

const RequiredJobs = [
    RJ_Harvest,
    RJ_Misc,
    RJ_Structures,
    RJ_WorkTarget
]
class RoomProvider extends BasicProcess<RoomProvider_Memory> {

    private _reqJobs!: IDictionary<string, number>;

    private _roomData!: RoomState;
    protected get roomData() {
        return this._roomData;
    }
    PrepTick() {
        this._reqJobs = {};
        let room = Game.rooms[this.memory.rID];
        this._roomData = this.View.GetRoomData(this.memory.rID)!;

        if (!this.roomData) {
            this.kernel.killProcess(this.pid, `RoomProvider couldn't find any data`);
            return;
        }
        if (!room) {
            return;
        }
        for (let i = 0; i < RequiredJobs.length; i++) {
            if (!this.roomData.groups[RequiredJobs[i]] || !this.kernel.getProcessByPID(this.roomData.groups[RequiredJobs[i]])) {
                this.roomData.groups[RequiredJobs[i]] = this.CreateRoomJob(RequiredJobs[i]);
            }
        }
    }
    RunThread(): ThreadState {
        if (Game.rooms[this.memory.rID]) {
            this.roomData.lastUpdated = Game.time;
        }
        return ThreadState_Done;
    }

    EndTick() {
        let jobIDs = Object.keys(this._reqJobs);
        for (let i = 0; i < jobIDs.length; i++) {
            while (this._reqJobs[jobIDs[i]] > 0) {
                this.CreateRoomJob(jobIDs[i])
                this._reqJobs[jobIDs[i]]--;
            }
        }
    }

    RoomJobCheckin(jobID: string) {
        this._reqJobs[jobID]--;
    }

    CreateRoomJob(jobID: string): PID | undefined {
        let newJobMemory: MemBase & { rID: RoomID } = {
            rID: this.memory.rID
        };

        switch (jobID) {
            case (CJ_Fortify):
                break;
            case (CJ_RemoteHarvest):
                newJobMemory.rID = this.roomData.RoomType.other.tr;
                (newJobMemory as RemoteHarvester_Memory).tr = this.memory.rID;
            case (CJ_Harvest):
                if (!this.roomData.RoomType.other.sources) {
                    this.roomData.RoomType.other.sources = {};
                }

                for (let i = 0; i < this.roomData.sourceIDs.length; i++) {
                    let pid = this.roomData.RoomType.other.sources[this.roomData.sourceIDs[i]];
                    if (!pid || !this.kernel.getProcessByPID(pid)) {
                        (newJobMemory as HarvesterMemory).src = this.roomData.sourceIDs[i];
                        let newPID = this.kernel.startProcess(jobID, newJobMemory);
                        this.roomData.RoomType.other.sources[this.roomData.sourceIDs[i]] = newPID;
                        return newPID;
                    }
                }
                this.log.info(`Trying to add a harvesterjob to a room that is already full.  Disallowed`);
                return;
            case (CJ_Refill):
                (newJobMemory as ControlledRoomRefiller_Memory).tr = this.memory.rID;
                break;
            case (CJ_Science):
                break;
            case (CJ_Scout):
                (newJobMemory as ScoutJob_Memory).n = []
                break;
            case (CJ_Work):
                (newJobMemory as Worker_Memory).target = {
                    at: AT_NoOp,
                    t: '',
                    tt: TT_None
                };
                (newJobMemory as Worker_Memory).tr = this.roomData.RoomType.other.tr;
                break;
            case (RJ_Harvest):
                (newJobMemory as RoomStateHarvest_Memory).harvesters = {};
                (newJobMemory as RoomStateMisc_Memory).hr = this.roomData.RoomType.other.tr;
                (newJobMemory as RoomStateActivity_Memory).lu = 0;
                (newJobMemory as RoomStateActivity_Memory).nb = true;
                break;
            case (RJ_Misc):
                (newJobMemory as RoomStateMisc_Memory).hr = this.roomData.RoomType.other.tr;
                (newJobMemory as RoomStateMisc_Memory).lr = 0;
            case (RJ_Structures):
            case (RJ_WorkTarget):
                (newJobMemory as RoomStateActivity_Memory).lu = 0;
            case (RJ_Tower): // nothing atm
            default:
                break;
        }

        return this.kernel.startProcess(jobID, newJobMemory);
    }
}