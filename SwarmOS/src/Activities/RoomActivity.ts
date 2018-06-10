export const OSPackage: IPackage<SpawnRegistry_Memory> = {
    install(processRegistry: IProcessRegistry, extensionRegistry: IExtensionRegistry) {
        processRegistry.register(SPKG_RoomActivity, RoomActivity);
    }
}

import { BasicProcess } from "Core/BasicTypes";

class RoomActivity extends BasicProcess<RoomActivity_Memory> {
    @extensionInterface(EXT_RoomView)
    protected View!: IRoomDataExtension;

    protected get roomData(): RoomState {
        return Memory.roomData.roomStateData[this.roomName];
    }

    private _room?: Room;
    protected get room(): Room | undefined {
        return this._room;
    }
    protected get roomName(): RoomID {
        return this.memory.rID;
    }

    PrepTick() {
        this._room = Game.rooms[this.roomName];
    }

    RunThread(): ThreadState {
        if (this.room) {
            this.roomData.owner = (this.room.controller && (
                (this.room.controller.owner && this.room.controller.owner.username) ||
                (this.room.controller.reservation && this.room.controller.reservation.username)
            )) || undefined;
            if (this.room.controller && this.room.controller.my) {
                this.View.SetScoutNexus(this.memory.rID);
            }

            if (this.shouldRefresh(11, this.roomData!.minUpdateOffset)) {
                this.roomData.resources = this.room.find(FIND_DROPPED_RESOURCES).map((value: Resource) => {
                    return value.id;
                });
            }

            if (this.shouldRefresh(27, this.roomData!.minUpdateOffset)) {
                this.roomData.tombstones = this.room.find(FIND_TOMBSTONES).map((value: Tombstone) => {
                    return value.id;
                });
            }

            // (TODO): Change this to plan out the layout
            if (this.shouldRefresh(29, this.roomData!.minUpdateOffset)) {
                this.roomData.cSites = this.room.find(FIND_CONSTRUCTION_SITES).map((value: ConstructionSite) => {
                    return value.id;
                });
            }

            // Update path stuff somehow.
            if (this.shouldRefresh(31, this.roomData!.minUpdateOffset)) {
                this.RefreshRoomStructures(this.roomName);
            }

            if (!this.roomData.hostPID || !this.kernel.getProcessByPID(this.roomData.hostPID)) {
                let newMem: Bootstrap_Memory = {
                    containers: [],
                    rID: this.memory.rID
                }
                this.roomData.hostPID = this.kernel.startProcess(PKG_BootRoom, newMem);
            }
            this.roomData.lastUpdated = Game.time;
        }

        return ThreadState_Done;
    }

    protected shouldRefresh(frequency: number, offset: number): boolean {
        if (Game.time - this.roomData.lastUpdated < frequency) {
            return true;
        }
        return (Game.time + offset) % frequency == 0;
    }

    protected RefreshRoomStructures(roomID: string): void {
        if (!this.room || !this.roomData) {
            return;
        }

        if (this.roomData.owner && this.room.controller!.owner) {
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
}