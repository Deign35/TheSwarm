export const OSPackage: IPackage<RoomStateMemory> = {
    install(processRegistry: IProcessRegistry, extensionRegistry: IExtensionRegistry) {
        processRegistry.register(PKG_RoomProvider, RoomProvider);
    }
}

import { PackageProviderBase, BasicProcess } from "Core/BasicTypes";

const RequiredJobs = [
    CR_Work,
    RJ_Misc,
    RJ_Structures,
    RJ_WorkTarget
]
class RoomProvider extends BasicProcess<RoomProvider_Memory> {
    @extensionInterface(EXT_RoomView)
    protected View!: IRoomDataExtension;

    private _reqJobs!: IDictionary<string, number>;
    PrepTick() {
        this._reqJobs = {};
        let room = Game.rooms[this.memory.rID];
        let data = this.View.GetRoomData(this.memory.rID);

        if (!data) {
            this.kernel.killProcess(this.pid, `RoomProvider couldn't find any data`);
            return;
        }
        if (!room) {
            return;
        }
        for (let i = 0; i < RequiredJobs.length; i++) {
            if (!data.groups[RequiredJobs[i]] || !this.kernel.getProcessByPID(data.groups[RequiredJobs[i]])) {
                this.CreateRoomJob(RequiredJobs[i]);
            }
        }

        switch (data.RoomType.type) {
            case (RT_Home):
                this._reqJobs[CJ_Refill] = 1;
                this._reqJobs[CJ_Harvest] = data.sourceIDs.length;
                this._reqJobs[CJ_Scout] = 2;
                if (data.structures.tower && data.structures.tower.length > 0) {
                    this._reqJobs[RJ_Tower] = 1;
                }

                /*if (data.structures.lab && data.structures.lab.length > 0) {
                    this._reqJobs[CJ_Science] = 1;
                }*/
                break;
            case (RT_RemoteHarvest):
                this._reqJobs[CJ_RemoteHarvest] = data.sourceIDs.length;
                break;
            case (RT_Other):
            case (RT_None):
            default:
                break;
        }
    }
    RunThread(): ThreadState {
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

    CreateRoomJob(jobID: string) {
        let newJobMemory: MemBase & { rID: RoomID } = {
            rID: this.memory.rID
        };

        switch (jobID) {
            case (CJ_Fortify):
                break;
            case (CJ_Harvest):
                let data = this.View.GetRoomData(this.memory.rID)!;
                if (!data.RoomType.other.sources) {
                    data.RoomType.other.sources = {};
                }

                for (let i = 0; i < data.sourceIDs.length; i++) {
                    let pid = data.RoomType.other.sources[data.sourceIDs[i]];
                    if (!pid || !this.kernel.getProcessByPID(pid)) {
                        (newJobMemory as HarvestJob_Memory).t = data.sourceIDs[i];
                        break;
                    }
                }
                this.log.info(`Trying to add a harvesterjob to a room that is already full.  Disallowed`);
                return;
            case (CJ_Refill):
                (newJobMemory as ControlledRoomRefiller_Memory).tr = this.memory.rID;
                break;
            case (CJ_RemoteHarvest):
                break;
            case (CJ_Science):
                break;
            case (CJ_Scout):
                (newJobMemory as ScoutJob_Memory).n = []
                break;
            case (CJ_Work):
                (newJobMemory as WorkerGroup_Memory).creeps = {}
                break;
            case (RJ_Misc):
            case (RJ_Structures):
            case (RJ_WorkTarget):
                (newJobMemory as RoomStateActivity_Memory).lu = 0;
            case (RJ_Tower): // nothing atm
            default:
                break;
        }

        this.kernel.startProcess(jobID, newJobMemory);
    }
}