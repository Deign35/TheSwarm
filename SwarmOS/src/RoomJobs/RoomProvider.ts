export const OSPackage: IPackage<RoomStateMemory> = {
    install(processRegistry: IProcessRegistry, extensionRegistry: IExtensionRegistry) {
        processRegistry.register(SPKG_RoomActivity, RoomProvider);
    }
}

import { PackageProviderBase, BasicProcess } from "Core/BasicTypes";

const RequiredJobs = [
    RJ_Misc,
    RJ_Structures,
    RJ_WorkTarget
]
class RoomProvider extends BasicProcess<RoomProvider_Memory> {
    @extensionInterface(EXT_RoomView)
    protected View!: IRoomDataExtension;

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

        switch (this.roomData.RoomType.type) {
            case (RT_Home):
                this._reqJobs[CJ_Work] = 1;
                this._reqJobs[CJ_Refill] = 1;
                this._reqJobs[CJ_Harvest] = this.roomData.sourceIDs.length;
                this._reqJobs[CJ_Scout] = 1;
                if (this.roomData.structures.tower && this.roomData.structures.tower.length > 0) {
                    this._reqJobs[RJ_Tower] = 1;
                }

                /*if (this.roomData.structures.lab && this.roomData.structures.lab.length > 0) {
                    this._reqJobs[CJ_Science] = 1;
                }*/
                break;
            case (RT_RemoteHarvest):
                this._reqJobs[CJ_Work] = 1;
                this._reqJobs[CJ_RemoteHarvest] = this.roomData.sourceIDs.length;
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
                (newJobMemory as ScoutJob_Memory).n = this.GatherNearbyRoomIDs(this.memory.rID, 3);
                break;
            case (CJ_Work):
                (newJobMemory as Worker_Memory).target = {
                    at: AT_NoOp,
                    t: '',
                    tt: TT_None
                };
                (newJobMemory as Worker_Memory).tr = this.roomData.RoomType.other.tr;
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

    protected GatherNearbyRoomIDs(centerRoom: RoomID, distance: number): RoomID[] {
        let nearbyRooms: RoomID[] = [];
        let nearby = Game.map.describeExits(centerRoom);
        if (nearby) {
            if (nearby["1"]) {
                nearbyRooms.push(nearby["1"]!);
                if (distance > 1) {
                    let furtherRooms = this.GatherNearbyRoomIDs(nearby["1"]!, distance - 1);
                    nearbyRooms.concat(furtherRooms)
                }
            }
            if (nearby["3"]) {
                nearbyRooms.push(nearby["3"]!);
                if (distance > 1) {
                    let furtherRooms = this.GatherNearbyRoomIDs(nearby["3"]!, distance - 1);
                    nearbyRooms.concat(furtherRooms)
                }
            }
            if (nearby["5"]) {
                nearbyRooms.push(nearby["5"]!);
                if (distance > 1) {
                    let furtherRooms = this.GatherNearbyRoomIDs(nearby["5"]!, distance - 1);
                    nearbyRooms.concat(furtherRooms)
                }
            }
            if (nearby["7"]) {
                nearbyRooms.push(nearby["7"]!);
                if (distance > 1) {
                    let furtherRooms = this.GatherNearbyRoomIDs(nearby["7"]!, distance - 1);
                    nearbyRooms.concat(furtherRooms)
                }
            }
        }
        return _.unique(nearbyRooms);
    }
}