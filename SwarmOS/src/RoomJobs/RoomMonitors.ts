export const OSPackage: IPackage<SpawnRegistry_Memory> = {
    install(processRegistry: IProcessRegistry, extensionRegistry: IExtensionRegistry) {
        //processRegistry.register(RJ_Misc, RoomStateMiscActivity);
    }
}

import { BasicProcess } from "Core/BasicTypes";

export abstract class RoomMonitorBase<T extends RoomMonitor_Memory> extends BasicProcess<T> {
    private _room?: Room;
    protected get room(): Room | undefined {
        return this._room;
    }
    private _roomData!: RoomState;
    protected get roomData() {
        return this._roomData;
    }
    PrepTick() {
        this._room = Game.rooms[this.memory.rID];
        this._roomData = this.roomView.GetRoomData(this.memory.rID)!;
        if (!this._roomData) {
            throw new Error(`Room monitor is missing roomdata ${this.memory.rID}`);
        }
    }

    RunThread() {
        let retVal: ThreadState = ThreadState_Done;
        if (this.shouldRefresh()) {
            retVal = this.MonitorRoom();
            if (retVal == ThreadState_Done && this.memory.lu == Game.time) {
                this.sleeper.sleep(this.pid, this.memory.fr - 1);
            }
        }

        return retVal;
    }

    protected shouldRefresh(): boolean {
        if (Game.time - this.memory.lu >= this.memory.fr) {
            return true;
        }
        return (Game.time + this.rngSeed) % this.memory.fr == 0;
    }

    abstract MonitorRoom(): ThreadState;
}

class RoomMonitor_WorkCapacity extends RoomMonitorBase<RoomMonitorWorkCapacity_Memory> {
    MonitorRoom(): ThreadState {
        if (!this.room) {
            return ThreadState_Done;
        }

        let newCount = 0;
        this.room.find(FIND_DROPPED_RESOURCES).map((value: Resource) => {
            newCount += value.energy || 0;
            return value.id;
        });
        if (this.roomData.RoomType.type == RT_Home && this.room.energyAvailable == this.room.energyCapacityAvailable) {
            if (this.memory.lr + 300 <= newCount || (this.memory.lr < newCount && newCount > 2000)) { // Should this scale?
                // Spawn a worker
                this.log.info(`Spawning a worker for ${this.memory.rID}.  Ground resources are growing quite quickly`);
                let workMem: Worker_Memory = {
                    home: this.memory.hr,
                    rID: this.memory.rID,
                    target: {
                        at: AT_NoOp,
                        t: '',
                        tt: TT_None
                    },
                    exp: true
                }

                this.kernel.startProcess(CJ_Work, workMem);
                // (TODO) spawn a small refiller too, just in case the room needs a reboot...
            } else {
                this.log.info(`Resources On the ground diff: ${newCount - this.memory.lr}`);
            }
        }

        this.memory.lr = newCount;
        this.memory.lu = Game.time;
        return ThreadState_Done;
    }
}

class RoomMonitor_Structures extends RoomMonitorBase<RoomMonitor_Memory> {
    MonitorRoom(): ThreadState {
        if (!this.room) {
            return ThreadState_Done;
        }
        if (this.roomData.owner == MY_USERNAME) {
            this.roomData.structures = {
                constructedWall: [],
                container: [],
                extension: [],
                lab: [],
                link: [],
                rampart: [],
                road: [],
                spawn: [],
                tower: []
            }
        } else {
            this.roomData.structures = {
                container: [],
                road: []
            }
        }

        let allStructures = this.room.find(FIND_STRUCTURES);
        for (let i = 0, length = allStructures.length; i < length; i++) {
            let structure = allStructures[i];
            if (!this.roomData.structures[structure.structureType]) {
                this.roomData.structures[structure.structureType] = [];
            }

            if ((this.roomData.structures[structure.structureType] as string[]).length !== undefined) {
                this.roomData.structures[structure.structureType]!.push(structure.id);
            }
        }

        this.memory.lu = Game.time;
        return ThreadState_Done;
    }
}

class RoomMonitor_Energy extends RoomMonitorBase<RoomMonitor_Memory> {
    MonitorRoom(): ThreadState {
        // Try to best allocate resources and shuffle them around based on needs.

        return ThreadState_Done;
    }
}

class RoomMonitor_WorkLocator extends RoomMonitorBase<RoomMonitorWorkTarget_Memory> {
    MonitorRoom(): ThreadState {

        return ThreadState_Done;
    }
}