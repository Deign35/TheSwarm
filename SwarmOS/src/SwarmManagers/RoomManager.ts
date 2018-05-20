/*declare var Memory: {
    // Put common memory here -- Desired body sizes
    roomGroups: RoomGroupListing
    // Or do I kill old processes and start new ones
    roomData: RoomViewData_Memory
}

import { BasicProcess, ExtensionBase } from "Core/BasicTypes";

export const OSPackage: IPackage<RoomViewData_Memory> = {
    install(processRegistry: IProcessRegistry, extensionRegistry: IExtensionRegistry) {
        processRegistry.register(PKG_RoomManager, RoomManager);
        extensionRegistry.register(EXT_RoomView, new RoomExtension(extensionRegistry));
    }
}

// (TODO): Convert to Room registry
class RoomManager extends BasicProcess<{}> {
    @extensionInterface(EXT_RoomView)
    View!: IRoomDataExtension;
    @extensionInterface(EXT_ThreadRegistry)
    protected thread!: IThreadRegistryExtensions;

    protected get memory(): RoomViewData_Memory {
        if (!Memory.roomData) {
            this.log.warn(`Initializing RoomManager memory`);
            Memory.roomData = {}
        }
        return Memory.roomData;
    }
    protected get groups(): RoomGroupListing {
        if (!Memory.roomGroups) {
            this.log.warn(`Initializing RoomGroup memory`);
            Memory.roomGroups = {};
        }

        return Memory.roomGroups;
    }
    executeProcess(): void {
        for (let roomID in Game.rooms) {
            let requiresNewRoomProcesses = false;
            if (!this.memory[roomID]) {
                requiresNewRoomProcesses = true;
            }
            let data = this.View.GetRoomData(roomID);
            if (!data) {
                this.log.fatal(`(ASSUMPTION FAILURE): A room is visible but has no data (${roomID})`);
                data = this.View.GetRoomData(roomID, true)!;
                if (!data) {
                    this.kernel.killProcess(this.pid);
                    return;
                } else {
                    // Actually assumption should be that this can't happen either
                    this.log.warn(`(ASSUMPTION RECOVERY): GetRoomData refresh fixed it (${roomID})`)
                }
            }
            if (requiresNewRoomProcesses) {
                this.groups[roomID] = {};
                if (data.sourceIDs.length > 0 || data.mineralIDs.length > 0) {
                    let newMem: ExtractionGroup_Memory = {
                        assignments: {},
                        childThreads: {},
                        enabled: true,
                        homeRoom: roomID,
                        PKG: CG_Extraction,
                        pri: Priority_Medium,
                        targetRoom: roomID
                    }
                    let newPID = this.kernel.startProcess(CG_Extraction, newMem);
                    this.kernel.setParent(newPID);
                    this.thread.RegisterAsThread(newPID);
                    this.groups[roomID][CG_Extraction] = newPID;
                }
                let newMem: ControlGroup_Memory = {
                    assignments: {},
                    childThreads: {},
                    enabled: true,
                    homeRoom: roomID,
                    PKG: CG_Control,
                    pri: Priority_Medium,
                    targetRoom: roomID
                }
                let newPID = this.kernel.startProcess(CG_Control, newMem);
                this.kernel.setParent(newPID);
                this.thread.RegisterAsThread(newPID);
                this.groups[roomID][CG_Control] = newPID;

                let infMem: InfrastructureGroup_Memory = {
                    assignments: {},
                    childThreads: {},
                    enabled: true,
                    homeRoom: roomID,
                    PKG: CG_Infrastructure,
                    pri: Priority_Medium,
                    targetRoom: roomID,
                    jobs: {
                        CreepBuilder: [],
                        CreepRefiller: [],
                        CreepUpgrader: []
                    },
                    unprocessedCreeps: []
                }
                let infPID = this.kernel.startProcess(CG_Infrastructure, infMem);
                this.kernel.setParent(infPID);
                this.thread.RegisterAsThread(infPID);
                this.groups[roomID][CG_Infrastructure] = infPID;
            }
        }
    }
}

const FRE_RoomStructures = primes_100[10]; // 10 = 29
class RoomExtension extends ExtensionBase implements IRoomDataExtension {
    protected get memory(): RoomViewData_Memory {
        if (!Memory.roomData) {
            this.log.warn(`Initializing RoomManager memory`);
            Memory.roomData = {}
        }
        return Memory.roomData;
    }

    protected getRoomData(roomID: string): { room?: Room, roomData?: RVD_RoomMemory } {
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
        this.log.info(`Update room structures ${roomID}`);

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
                tower: []
            }
        } else {
            roomData.structures = {
                container: [],
                road: []
            }
        }

        if (room.controller) {
            roomData.controller = room.controller.id;
        }
        if (room.storage) {
            roomData.storage = room.storage.id;
        }
        if (room.terminal) {
            roomData.terminal = room.terminal.id;
        }

        let allStructures = room.find(FIND_STRUCTURES);
        for (let i = 0, length = allStructures.length; i < length; i++) {
            let structure = allStructures[i];
            if (roomData.structures[structure.structureType]) {
                let structureData: RVD_StructureData = {
                    id: structure.id,
                }
                if (structure.hits < structure.hitsMax) {
                    structureData.hits = structure.hits;
                }
                if (structure.structureType == STRUCTURE_CONTAINER ||
                    structure.structureType == STRUCTURE_KEEPER_LAIR ||
                    structure.structureType == STRUCTURE_LINK ||
                    structure.structureType == STRUCTURE_NUKER ||
                    structure.structureType == STRUCTURE_PORTAL ||
                    structure.structureType == STRUCTURE_POWER_BANK ||
                    structure.structureType == STRUCTURE_POWER_SPAWN ||
                    structure.structureType == STRUCTURE_SPAWN ||
                    structure.structureType == STRUCTURE_TOWER ||
                    /*structure.structureType == STRUCTURE_WALL ||
                    structure.structureType == STRUCTURE_ROAD ||
                    structure.structureType == STRUCTURE_RAMPART ||*
                    structure.structureType == STRUCTURE_LAB) {

                    structureData.room = structure.pos.roomName;
                    structureData.x = structure.pos.x;
                    structureData.y = structure.pos.y;
                }
                roomData.structures[structure.structureType]!.push(structureData);
            } else {
                // flash data for the rest?
            }
        }
    }

    GetRoomData(roomID: string, forceRefresh: boolean = false): RVD_RoomMemory | undefined {
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

    ForceResetRVDMemory(roomID: string) {
        if (this.memory[roomID]) {
            delete this.memory[roomID];
        }
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
                return {
                    hits: value.progress,
                    id: value.id,
                    room: value.pos.roomName,
                    x: value.pos.x,
                    y: value.pos.y
                }
            });
        }
        // Update path stuff somehow.
    }
}*/