declare var Memory: {
    roomData: RoomStateMemory
}

import { ExtensionBase, BasicProcess } from "Core/BasicTypes";

export const OSPackage: IPackage<RoomStateMemory> = {
    install(processRegistry: IProcessRegistry, extensionRegistry: IExtensionRegistry) {
        processRegistry.register(PKG_RoomManager, RoomRegistry);
        extensionRegistry.register(EXT_RoomView, new RoomExtension(extensionRegistry));
    }
}

class RoomRegistry extends BasicProcess<RoomStateMemory> {
    get logID() { return 'RoomRegistry' };
    get logLevel() { return LOG_INFO as LogLevel; }
    @extensionInterface(EXT_RoomView)
    RoomView!: RoomExtension;
    protected get memory(): RoomStateMemory {
        if (!Memory.roomData) {
            this.log.warn(`Initializing RoomManager memory`);
            Memory.roomData = {
                roomStateData: {}
            }
        }
        return Memory.roomData;
    }
    RunThread(): ThreadState {
        for (let roomID in Game.rooms) {
            let data = this.RoomView.GetRoomData(roomID);
            if (data && (!data.hostPID || !this.kernel.getProcessByPID(data.hostPID))) {
                let room = Game.rooms[roomID];
                if (room.controller) {
                    if (room.controller.my) {
                        let newMem: CreepGroup_Memory = {
                            assignments: {},
                            homeRoom: roomID,
                            targetRoom: roomID,
                        }
                        let newPID = this.kernel.startProcess(PKG_SimpleOwnedRoom, newMem);
                        this.kernel.setParent(newPID);
                        this.memory.roomStateData[roomID]!.hostPID = newPID;
                    }
                }
            }
        }

        return ThreadState_Done;
    }
}

const FRE_RoomStructures = primes_100[10]; // 10 = 29
class RoomExtension extends ExtensionBase {
    protected get memory(): IDictionary<RoomID, RoomState> {
        if (!Memory.roomData) {
            this.log.warn(`Initializing RoomManager memory`);
            Memory.roomData = {
                roomStateData: {}
            }
        }
        return Memory.roomData.roomStateData;
    }

    protected getRoomData(roomID: string): { room?: Room, roomData?: RoomState } {
        let room = Game.rooms[roomID];
        if (!this.memory[roomID]) {
            if (!room) {
                return { room: undefined, roomData: undefined };
            }
            this.InitRoomData(room);
        }
        return { room, roomData: this.memory[roomID] };
    }

    private InitRoomData(room: Room) {
        this.log.info(`Initialize new room ${room.name}`);
        this.memory[room.name] = {
            owner: '',
            lastUpdated: 0,
            cSites: [],
            resources: [],
            tombstones: [],
            needsRepair: [],
            mineralIDs: room.find(FIND_MINERALS)!.map((val: Mineral) => {
                return val.id;
            }),
            minUpdateOffset: GetRandomIndex(primes_3000) || 73,
            sourceIDs: room.find(FIND_SOURCES)!.map((val: Source) => {
                return val.id;
            }),
            structures: {
                container: [],
                road: []
            },
            groups: {},
            hostPID: ''
        }
    }

    protected shouldRefresh(frequency: number, offset: number): boolean {
        return (Game.time + offset) % frequency == 0;
    } // (TODO): Needs to be replaced, if a room is out of view on the frame its supposed to update, it may never update.

    protected RefreshRoomStructures(roomID: string): void {
        let { room, roomData } = this.getRoomData(roomID);
        if (!room || !roomData) {
            this.log.debug(() => (room ? `Room has not been initialized[${roomID}]` : `Room out of view [${roomID}]`));
            return;
        }
        this.log.debug(`Update room structures ${roomID}`);

        if (roomData.owner && room.controller!.owner) {
            roomData.structures = {
                constructedWall: [],
                container: [],
                extension: [],
                lab: [],
                link: [],
                rampart: [],
                road: [],
                spawn: [],
                tower: [],
                controller: room.controller!.id,
                storage: room.storage && room.storage.id,
                terminal: room.terminal && room.terminal.id
            }
        } else {
            roomData.structures = {
                container: [],
                road: [],
                controller: room.controller && room.controller.id
            }
        }

        roomData.needsRepair = [];
        let allStructures = room.find(FIND_STRUCTURES);
        for (let i = 0, length = allStructures.length; i < length; i++) {
            let structure = allStructures[i];
            if (roomData.structures[structure.structureType]) {
                if (structure.structureType == STRUCTURE_CONTAINER ||
                    structure.structureType == STRUCTURE_EXTENSION ||
                    structure.structureType == STRUCTURE_KEEPER_LAIR ||
                    structure.structureType == STRUCTURE_LINK ||
                    structure.structureType == STRUCTURE_NUKER ||
                    structure.structureType == STRUCTURE_PORTAL ||
                    structure.structureType == STRUCTURE_POWER_BANK ||
                    structure.structureType == STRUCTURE_POWER_SPAWN ||
                    structure.structureType == STRUCTURE_SPAWN ||
                    structure.structureType == STRUCTURE_TOWER ||
                    structure.structureType == STRUCTURE_WALL ||
                    structure.structureType == STRUCTURE_ROAD ||
                    structure.structureType == STRUCTURE_RAMPART ||
                    structure.structureType == STRUCTURE_LAB) {
                    roomData.structures[structure.structureType]!.push(structure.id);
                    if (structure.hits < structure.hitsMax && structure.structureType != STRUCTURE_WALL && structure.structureType != STRUCTURE_RAMPART) {
                        roomData.needsRepair.push(structure.id);
                    }
                }
            }
        }
    }

    GetRoomData(roomID: string, forceRefresh: boolean = false): RoomState | undefined {
        forceRefresh = forceRefresh || !this.memory[roomID] || (this.memory[roomID].lastUpdated == 0);
        let { room, roomData } = this.getRoomData(roomID);
        if (room) {
            if (roomData!.lastUpdated != Game.time) {
                this.RefreshRoom(roomID, forceRefresh);
                if (forceRefresh || this.shouldRefresh(FRE_RoomStructures, roomData!.minUpdateOffset)) {
                    this.RefreshRoomStructures(roomID);
                }
            }
        } else {
            this.log.debug(`Room out of view [${roomID}]`);
        }
        if (!roomData) {
            this.log.error(`Room has not been initialized [${roomID}]`);
            return;
        }
        return this.memory[roomID];
    }

    protected RefreshRoom(roomID: string, force: boolean = false) {
        let { room, roomData } = this.getRoomData(roomID);
        if (!room || !roomData) {
            this.log.debug(() => (room ? `Room has not been initialized[${roomID}]` : `Room out of view [${roomID}]`));
            return;
        }
        this.log.trace(`Examine room ${roomID}`);

        roomData.lastUpdated = Game.time;
        roomData.owner = (room.controller && (
            (room.controller.owner && room.controller.owner.username) ||
            (room.controller.reservation && room.controller.reservation.username)
        )) || undefined;

        if (force || this.shouldRefresh(11, roomData!.minUpdateOffset)) {
            this.log.trace(`Examine room[DroppedResources] ${roomID}`);
            roomData.resources = room.find(FIND_DROPPED_RESOURCES).map((value: Resource) => {
                return value.id;
            });
        }
        if (force || this.shouldRefresh(27, roomData!.minUpdateOffset)) {
            this.log.trace(`Examine room[Tombstones] ${roomID}`);
            roomData.tombstones = room.find(FIND_TOMBSTONES).map((value: Tombstone) => {
                return value.id;
            });
        }
        if (force || this.shouldRefresh(29, roomData!.minUpdateOffset)) {
            this.log.trace(`Examine room[ConstructionSites] ${roomID}`);
            roomData.cSites = room.find(FIND_CONSTRUCTION_SITES).map((value: ConstructionSite) => {
                return value.id;
            });
        }
        // Update path stuff somehow.
    }
}