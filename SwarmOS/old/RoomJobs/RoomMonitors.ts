export const OSPackage: IPackage<SpawnRegistry_Memory> = {
    install(processRegistry: IProcessRegistry, extensionRegistry: IExtensionRegistry) {
        processRegistry.register(RJ_Misc, RoomMonitor_Misc);
        processRegistry.register(RJ_Structures, RoomMonitor_Structures);
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
    protected get refreshFrequency() {
        return this.memory.fr || 1;
    }
    PrepTick() {
        this._room = Game.rooms[this.memory.rID];
        this._roomData = this.roomView.GetRoomData(this.memory.rID)!;
        if (!this._roomData) {
            throw new Error(`Room monitor is missing roomdata ${this.memory.rID}`);
        }
        if (this.memory.nb && (!this.InitMonitor || this.InitMonitor())) {
            delete this.memory.nb;
        }
    }

    RunThread() {
        if (this.refreshFrequency <= 1) {
            return this.MonitorRoom();
        } else {
            let retVal: ThreadState = ThreadState_Done;
            if (this.shouldRefresh(this.refreshFrequency, this.memory.lu)) {
                retVal = this.MonitorRoom();
                if (retVal == ThreadState_Done && this.memory.lu == Game.time) {
                    this.sleeper.sleep(this.pid, this.refreshFrequency - 1);
                }
            }

            return retVal;
        }
    }

    protected shouldRefresh(frequency: number, lastUpdate: number): boolean {
        if (Game.time - lastUpdate >= frequency) {
            return true;
        }
        return (Game.time + this.rngSeed) % frequency == 0;
    }

    InitMonitor?(): boolean;
    abstract MonitorRoom(): ThreadState;
}

class RoomMonitor_Misc extends RoomMonitorBase<RoomMonitorWorkCapacity_Memory> {
    MonitorRoom(): ThreadState {
        if (!this.room) {
            return ThreadState_Done;
        }

        this.roomData.owner = (this.room.controller && this.room.controller.owner && this.room.controller.owner.username) || undefined;
        let newCount = 0;
        this.room.find(FIND_DROPPED_RESOURCES).map((value: Resource) => {
            newCount += value.energy || 0;
            return value.id;
        });
        if (this.room.energyAvailable == this.room.energyCapacityAvailable) {
            if (this.memory.lr + this.memory.tA <= newCount || (this.memory.lr < newCount && newCount > this.memory.tT)) {
                // Spawn a worker
                // Should check if a refiller needs to be spawned or not.
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

                this.kernel.startProcess(CR_Work, workMem);
                // (TODO) spawn a small refiller too, just in case the room needs a reboot...
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

        let impassableMap = new Array(ROOM_ARRAY_SIZE).fill(1);
        let roadMap = new Array(ROOM_ARRAY_SIZE).fill(0);
        let allStructures = this.room.find(FIND_STRUCTURES);
        for (let i = 0, length = allStructures.length; i < length; i++) {
            let structure = allStructures[i];
            if ((this.roomData.structures[structure.structureType] as string[]).length !== undefined) {
                this.roomData.structures[structure.structureType]!.push(structure.id);
            }

            if (structure.structureType == STRUCTURE_CONTAINER ||
                structure.structureType == STRUCTURE_PORTAL ||
                structure.structureType == STRUCTURE_RAMPART ||
                structure.structureType == STRUCTURE_ROAD) {
                if (structure.structureType == STRUCTURE_ROAD) {
                    roadMap.push[structure.pos.y * ROOM_WIDTH + structure.pos.x] = 1;
                }
                continue;
            }
            impassableMap[structure.pos.y * ROOM_WIDTH + structure.pos.x] = 0;
        }

        // (TODO): Should add that wall terrain also equal 0.
        this.roomData.distanceMaps[ML_Impassable] = impassableMap;
        this.roomData.distanceMaps[ML_Road] = roadMap;

        this.memory.lu = Game.time;
        return ThreadState_Done;
    }
}