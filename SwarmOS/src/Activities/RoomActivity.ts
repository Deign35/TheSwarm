export const OSPackage: IPackage<SpawnRegistry_Memory> = {
    install(processRegistry: IProcessRegistry, extensionRegistry: IExtensionRegistry) {
        processRegistry.register(SPKG_RoomActivity, RoomActivity);
    }
}

import { BasicProcess } from "Core/BasicTypes";

class RoomActivity extends BasicProcess<RoomActivity_Memory> {
    @extensionInterface(EXT_RoomView)
    protected View!: IRoomDataExtension;

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
            let roomData = this.View.GetRoomData(this.memory.rID)!;
            roomData.owner = (this.room.controller && (
                (this.room.controller.owner && this.room.controller.owner.username) ||
                (this.room.controller.reservation && this.room.controller.reservation.username)
            )) || undefined;

            if (!roomData.groups.CR_Work) {
                let workMem: WorkerGroup_Memory = {
                    rID: this.memory.rID,
                    creeps: {}
                }
                roomData.groups.CR_Work = {
                    pid: this.kernel.startProcess(CJ_Work, workMem),
                    energy: {},
                    targets: {}
                }
            }

            // I control this room
            if (this.room.controller && this.room.controller.my) {
                this.View.SetScoutNexus(this.memory.rID);
                if (!roomData.groups.CR_Scout || !this.kernel.getProcessByPID(roomData.groups.CR_Scout)) {
                    let scoutMem: ScoutJob_Memory = {
                        n: _.without(this.GatherNearbyRoomIDs(this.memory.rID, 3), this.memory.rID),
                        rID: this.memory.rID
                    }
                    roomData.groups.CR_Scout = this.kernel.startProcess(CJ_Scout, scoutMem);
                }
                if (!roomData.groups.CR_Harvester) {
                    roomData.groups.CR_Harvester = {};
                }
                let sources = this.room.find(FIND_SOURCES);
                for (let i = 0; i < sources.length; i++) {
                    if (!roomData.groups.CR_Harvester[sources[i].id] || !this.kernel.getProcessByPID(roomData.groups.CR_Harvester[sources[i].id])) {
                        let harvMem: HarvestJob_Memory = {
                            rID: this.memory.rID,
                            t: sources[i].id
                        }
                        roomData.groups.CR_Harvester[sources[i].id] = (this.kernel.startProcess(CJ_Harvest, harvMem));
                    }
                    if (this.room.energyCapacityAvailable < 550) {
                        if (!roomData.groups.CR_BootFill) {
                            let bootMem: BootstrapRefiller_Memory = {
                                hb: false,
                                s: sources[i].id,
                                rID: this.memory.rID,
                                ref: {}
                            }
                            roomData.groups.CR_BootFill = {
                                pid: this.kernel.startProcess(CJ_BootRefill, bootMem),
                                energy: {},
                                targets: {}
                            }
                        }
                    } else {
                        if (roomData.groups.CR_BootFill) {

                        }
                    }
                }

                if (!roomData.groups.CR_SpawnFill) {
                    let refillMem: ControlledRoomRefiller_Memory = {
                        rID: this.memory.rID,
                        tr: this.memory.rID,

                    }
                    roomData.groups.CR_SpawnFill = {
                        pid: this.kernel.startProcess(CJ_Refill, refillMem),
                        energy: {},
                        targets: {}
                    }
                }

            } else {
                // I do not own this room
                if (roomData.groups.CR_Scout) {
                    this.kernel.killProcess(roomData.groups.CR_Scout);
                    delete roomData.groups.CR_Scout;
                }
                if (roomData.groups.CR_Harvester) {
                    let ids = Object.keys(roomData.groups.CR_Harvester);
                    for (let i = 0; i < ids.length; i++) {
                        this.kernel.killProcess(roomData.groups.CR_Harvester[i]);
                    }
                    delete roomData.groups.CR_Harvester;
                }
                if (roomData.groups.CR_BootFill) {
                    this.kernel.killProcess(roomData.groups.CR_BootFill.pid);
                    delete roomData.groups.CR_BootFill;
                }
                if (roomData.groups.CR_SpawnFill) {
                    this.kernel.killProcess(roomData.groups.CR_SpawnFill.pid);
                    delete roomData.groups.CR_SpawnFill;
                }
            }
            if (this.shouldRefresh(11, roomData!.minUpdateOffset, roomData.lastUpdated)) {
                roomData.resources = this.room.find(FIND_DROPPED_RESOURCES).map((value: Resource) => {
                    return value.id;
                });
            }

            if (this.shouldRefresh(27, roomData!.minUpdateOffset, roomData.lastUpdated)) {
                roomData.tombstones = this.room.find(FIND_TOMBSTONES).map((value: Tombstone) => {
                    return value.id;
                });
            }

            // (TODO): Change this to plan out the layout
            if (this.shouldRefresh(29, roomData!.minUpdateOffset, roomData.lastUpdated)) {
                roomData.cSites = this.room.find(FIND_CONSTRUCTION_SITES).map((value: ConstructionSite) => {
                    return value.id;
                });
            }

            // Update path stuff somehow.
            if (this.shouldRefresh(31, roomData!.minUpdateOffset, roomData.lastUpdated)) {
                this.RefreshRoomStructures(roomData);
            }
            // (TODO): What to do when the hostPID is dead?  What should it change to?
            roomData.lastUpdated = Game.time;
        }

        return ThreadState_Done;
    }

    protected shouldRefresh(frequency: number, offset: number, lastUpdated: number): boolean {
        if (Game.time - lastUpdated < frequency) {
            return true;
        }
        return (Game.time + offset) % frequency == 0;
    }

    protected RefreshRoomStructures(roomData: RoomState): void {
        if (!this.room) {
            return;
        }
        if (roomData.owner && this.room.controller!.owner) {
            roomData.structures = {
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
            roomData.structures = {
                container: [],
                road: []
            }
        }

        roomData.needsRepair = [];
        let allStructures = this.room.find(FIND_STRUCTURES);
        for (let i = 0, length = allStructures.length; i < length; i++) {
            let structure = allStructures[i];
            if (!roomData.structures[structure.structureType]) {
                roomData.structures[structure.structureType] = [];
            }

            if ((roomData.structures[structure.structureType] as string[]).length !== undefined) {
                roomData.structures[structure.structureType]!.push(structure.id);
            }
            // (TODO): Better prioritization
            if (structure.hits + 1000 < structure.hitsMax && structure.structureType != STRUCTURE_WALL && structure.structureType != STRUCTURE_RAMPART) {
                roomData.needsRepair.push(structure.id);
            }
        }
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