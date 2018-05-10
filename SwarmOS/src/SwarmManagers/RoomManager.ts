declare var Memory: {
    roomData: SDictionary<RoomData_Memory>
}

if (!Memory.roomData) {
    Memory.roomData = {};
}
import { ProcessBase, ExtensionBase } from "Core/BasicTypes";

export const IN_RoomManager = 'RoomManager';
export const EXT_RoomView = 'RoomView';
export const EXT_RoomStructures = 'RoomStructure';
export const bundle: IPosisBundle<SDictionary<RoomData_Memory>> = {
    install(processRegistry: IPosisProcessRegistry, extensionRegistry: IPosisExtensionRegistry) {
        processRegistry.register(IN_RoomManager, RoomManager);
        let roomDataExtension = new RoomExtension(extensionRegistry);
        extensionRegistry.register(EXT_RoomView, roomDataExtension);
        extensionRegistry.register(EXT_RoomStructures, roomDataExtension);
    },
    rootImageName: IN_RoomManager
}

class RoomManager extends ProcessBase {
    @posisInterface(EXT_RoomView)
    View!: IRoomViewExtension;
    @posisInterface(EXT_RoomStructures)
    Structures!: IRoomStructuresExtension;

    handleMissingMemory() {
        if (!Memory.roomData) {
            Memory.roomData = {};
        }
        return Memory.roomData;
    }
    executeProcess(): void {
        for (let roomID in Game.rooms) {
            let data = this.View.GetRoomData(roomID)!;
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
            if (!data.pid || !this.kernel.getProcessById(data.pid)) {
                let newRoomProcess = this.kernel.startProcess('TBD', {});
                if (newRoomProcess && newRoomProcess.pid && newRoomProcess.process) {
                    data.pid = newRoomProcess.pid;
                }
            }
        }
    }
}


const FRE_RoomStructures = primes_100[10]; // 10 = 29
class RoomExtension extends ExtensionBase implements IRoomStructuresExtension, IRoomViewExtension {
    protected get memory(): SDictionary<RoomData_Memory> {
        return Memory.roomData;
    }
    protected getRoomData(roomID: string): { room?: Room, roomData?: RoomData_Memory } {
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
            cSites: [],
            lastUpdated: 0,
            mineralIDs: room.find(FIND_MINERALS)!.map((val: Mineral) => {
                return val.id;
            }),
            minUpdateOffset: GetRandomIndex(primes_3000) || 73,
            owner: '',
            resources: [],
            sourceIDs: room.find(FIND_SOURCES)!.map((val: Source) => {
                return val.id;
            }),
            structures: {
                container: [],
                road: []
            },
            tombstones: [],
        }
    }

    protected shouldRefresh(frequency: number, offset: number): boolean {
        return (Game.time + offset) % frequency == 0;
    }
    RefreshRoomStructures(roomID: string): void {
        let { room, roomData } = this.getRoomData(roomID);
        if (!room || !roomData) {
            this.log.debug(() => (room ? `Room has not been initialized[${roomID}]` : `Room out of view [${roomID}]`));
            return;
        }

        this.log.info(`Update room structures ${roomID}`);

        roomData.owner = (room.controller && (
            (room.controller.owner && room.controller.owner.username) ||
            (room.controller.reservation && room.controller.reservation.username)
        )) || undefined;

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
        let allStructures = room.find(FIND_STRUCTURES);
        for (let i = 0, length = allStructures.length; i < length; i++) {
            let structure = allStructures[i];
            if (roomData.structures[structure.structureType]) {
                let structureData: RoomData_StructureData = {
                    hits: structure.hits,
                    id: structure.id,
                }
                if (structure.structureType == STRUCTURE_CONTAINER ||
                    structure.structureType == STRUCTURE_CONTROLLER ||
                    structure.structureType == STRUCTURE_KEEPER_LAIR ||
                    structure.structureType == STRUCTURE_LINK ||
                    structure.structureType == STRUCTURE_NUKER ||
                    structure.structureType == STRUCTURE_PORTAL ||
                    structure.structureType == STRUCTURE_POWER_BANK ||
                    structure.structureType == STRUCTURE_POWER_SPAWN ||
                    structure.structureType == STRUCTURE_SPAWN ||
                    structure.structureType == STRUCTURE_STORAGE ||
                    structure.structureType == STRUCTURE_TOWER ||
                    structure.structureType == STRUCTURE_TERMINAL ||
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
    AddStructure(structure: Structure): void {
        //let roomInfo = this.RoomView.View(structure.room.name);
        //if(!roomInfo || !)
    }
    GetRoomData(roomID: string, forceRefresh: boolean = false): RoomData_Memory | undefined {
        forceRefresh = forceRefresh || !this.memory[roomID] || (this.memory[roomID].lastUpdated == 0);
        let { room, roomData } = this.getRoomData(roomID);
        if (room) {
            this.RefreshRoom(roomID, forceRefresh);
            if (forceRefresh || this.shouldRefresh(FRE_RoomStructures, roomData!.minUpdateOffset)) {
                this.RefreshRoomStructures(roomID);
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

    RefreshRoom(roomID: string, force: boolean = false) {
        let { room, roomData } = this.getRoomData(roomID);
        if (!room || !roomData) {
            this.log.debug(() => (room ? `Room has not been initialized[${roomID}]` : `Room out of view [${roomID}]`));
            return;
        }

        this.log.trace(`Examine room ${roomID}`);
        roomData.lastUpdated = Game.time;
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
}