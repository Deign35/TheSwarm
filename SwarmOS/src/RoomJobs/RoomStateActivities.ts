export const OSPackage: IPackage<SpawnRegistry_Memory> = {
    install(processRegistry: IProcessRegistry, extensionRegistry: IExtensionRegistry) {
        processRegistry.register(RJ_Misc, RoomStateMiscActivity);
    }
}

import { BasicProcess } from "Core/BasicTypes";

export abstract class RoomStateActivity<T extends RoomStateActivity_Memory> extends BasicProcess<T> {
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
        this._roomData = this.View.GetRoomData(this.memory.rID)!;
        if (!this._roomData) {
            throw new Error(`Roomstate activity is missing roomdata ${this.memory.rID}`);
        }
    }

    protected shouldRefresh(frequency: number, offset: number, lastUpdated: number): boolean {
        if (Game.time - lastUpdated >= frequency) {
            return true;
        }
        return (Game.time + offset) % frequency == 0;
    }
}

class RoomStateMiscActivity extends RoomStateActivity<RoomStateMisc_Memory> {
    RunThread(): ThreadState {
        if (!this.room) {
            return ThreadState_Done;
        }
        if (this.memory.nb) {
            this.roomData.mineralIDs = this.room.find(FIND_MINERALS).map((value: Mineral) => {
                return value.id;
            })
            delete this.memory.nb;
        }

        this.roomData.owner = (this.room.controller && this.room.controller.owner && this.room.controller.owner.username) || undefined;
        if (this.shouldRefresh(11, this.roomData.minUpdateOffset, this.memory.lu)) {
            let newCount = 0;
            this.room.find(FIND_DROPPED_RESOURCES).map((value: Resource) => {
                newCount += value.energy || 0;
                return value.id;
            });

            if (this.roomData.RoomType.type == RT_Home && this.room.energyAvailable == this.room.energyCapacityAvailable) {
                if (this.memory.lr + 300 <= newCount || (this.memory.lr < newCount && newCount > 2000)) { // Should this scale?
                    // Spawn a worker
                    this.log.info(`Spawning a worker for ${this.memory.rID}.  Ground resources are growing quite quickly`);
                    let newMem: Worker_Memory = {
                        home: this.memory.hr,
                        rID: this.memory.rID,
                        target: {
                            at: AT_NoOp,
                            t: '',
                            tt: TT_None
                        },
                        exp: true
                    }

                    this.kernel.startProcess(CJ_Work, newMem);
                } else {
                    this.log.debug(`Resources On the ground diff: ${newCount - this.memory.lr}`);
                }
            }

            this.memory.lr = newCount;
        }

        this.memory.lu = Game.time;
        return ThreadState_Done;
    }
}