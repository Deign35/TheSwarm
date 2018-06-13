export const OSPackage: IPackage<SpawnRegistry_Memory> = {
    install(processRegistry: IProcessRegistry, extensionRegistry: IExtensionRegistry) {
        processRegistry.register(RJ_Misc, RoomStateMiscActivity);
        processRegistry.register(RJ_Structures, RoomStateStructureActivity);
    }
}

import { BasicProcess } from "Core/BasicTypes";

export abstract class RoomStateActivity<T extends RoomStateActivity_Memory> extends BasicProcess<T> {
    @extensionInterface(EXT_RoomView)
    protected View!: IRoomDataExtension;

    private _room?: Room;
    protected get room(): Room | undefined {
        return this._room;
    }
    private _roomData!: RoomState;
    protected get roomData() {
        return this._roomData;
    }
    protected get roomName(): RoomID {
        return this.memory.rID;
    }
    PrepTick() {
        this._room = Game.rooms[this.roomName];
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

class RoomStateMiscActivity extends RoomStateActivity<RoomStateActivity_Memory> {
    RunThread(): ThreadState {
        if (!this.room) {
            return ThreadState_Done;
        }
        if (this.memory.nb) {
            this.roomData.mineralIDs = this.room.find(FIND_MINERALS).map((value: Mineral) => {
                return value.id;
            })
            this.roomData.sourceIDs = this.room.find(FIND_SOURCES).map((value: Source) => {
                return value.id;
            })

            delete this.memory.nb;
        }

        this.roomData.owner = (this.room.controller && this.room.controller.owner && this.room.controller.owner.username) || undefined;
        if (this.shouldRefresh(11, this.roomData.minUpdateOffset, this.memory.lu)) {
            this.roomData.resources = this.room.find(FIND_DROPPED_RESOURCES).map((value: Resource) => {
                return value.id;
            });
        }

        if (this.shouldRefresh(17, this.roomData.minUpdateOffset, this.memory.lu)) {
            this.roomData.tombstones = this.room.find(FIND_TOMBSTONES).map((value: Tombstone) => {
                return value.id;
            });
        }

        this.memory.lu = Game.time;
        return ThreadState_Done;
    }
}

class RoomStateStructureActivity extends RoomStateActivity<RoomStateActivity_Memory> {
    RunThread(): ThreadState {
        if (!this.room) {
            return ThreadState_Done;
        }
        if (this.shouldRefresh(27, this.roomData.minUpdateOffset, this.memory.lu)) {
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

            this.roomData.needsRepair = [];
            let allStructures = this.room.find(FIND_STRUCTURES);
            for (let i = 0, length = allStructures.length; i < length; i++) {
                let structure = allStructures[i];
                if (!this.roomData.structures[structure.structureType]) {
                    this.roomData.structures[structure.structureType] = [];
                }

                if ((this.roomData.structures[structure.structureType] as string[]).length !== undefined) {
                    this.roomData.structures[structure.structureType]!.push(structure.id);
                }
                // (TODO): Better prioritization
                if (structure.hits + 1000 < structure.hitsMax && structure.structureType != STRUCTURE_WALL && structure.structureType != STRUCTURE_RAMPART) {
                    this.roomData.needsRepair.push(structure.id);
                }
            }
        }
        this.memory.lu = Game.time;
        return ThreadState_Done;
    }
}