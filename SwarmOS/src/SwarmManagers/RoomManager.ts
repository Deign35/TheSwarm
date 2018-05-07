if (!Memory.RoomData) {
    Memory.RoomData = {};
}
import { BaseProcess } from "Core/BaseProcess";
import { ExtensionBase } from "Core/BaseExtension";

const FRE_RoomStructures = primes_100[10]; // 10 = 29
class RoomManager extends BaseProcess {
    run(): void {
        let roomView = this.context.queryPosisInterface(EXT_RoomView);
        let roomStructures = this.context.queryPosisInterface(EXT_RoomStructures);
        for (let roomID in Game.rooms) {
            roomView.View(roomID);
        }
    }
}
class RoomExtension extends ExtensionBase {
    protected get memory(): RoomView_Memory {
        return Memory.RoomData;
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
        Logger.info(`Initialize new room ${room.name}`);
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
}
class RoomStructuresExtension extends RoomExtension implements IRoomStructuresExtension {
    PopulateRoomStructures(roomID: string): void {
        let { room, roomData } = this.getRoomData(roomID);
        if (!room) {
            Logger.debug(`Room out of view [${roomID}]`)
            return;
        }
        if (!roomData) {
            Logger.error(`Room has not been initialized [${roomID}]`);
            return;
        }

        Logger.info(`Update room structures ${roomID}`);

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

    }
}
class RoomViewExtension extends RoomExtension implements IRoomManagerExtension {
    constructor(extensionRegistry: IPosisExtensionRegistry) {
        super(extensionRegistry);
    }
    get RoomStructure() {
        if (!this._structuresExt) {
            this._structuresExt = this.extensionRegistry.getExtension(EXT_RoomStructures) as IRoomStructuresExtension;
        }
        return this._structuresExt;
    }
    private _structuresExt?: IRoomStructuresExtension;

    View(roomID: string, forceUpdate: boolean = false): RoomData_Memory | undefined {
        forceUpdate = forceUpdate || !this.memory[roomID] || (this.memory[roomID].lastUpdated == 0);
        let { room, roomData } = this.getRoomData(roomID);
        if (room) {
            this.Examine(roomID, forceUpdate);
            if (forceUpdate || this.shouldRefresh(FRE_RoomStructures, roomData!.minUpdateOffset)) {
                this.RoomStructure.PopulateRoomStructures(roomID);
            }
        } else {
            Logger.debug(`Room out of view [${roomID}]`);
        }
        if (!roomData) {
            Logger.error(`Room has not been initialized [${roomID}]`);
            return;
        }

        return this.memory[roomID];
    }

    Examine(roomID: string, forceUpdate: boolean = false) {
        let { room, roomData } = this.getRoomData(roomID);
        if (!room) {
            Logger.debug(`Room out of view [${roomID}]`)
            return;
        }
        if (!roomData) {
            Logger.error(`Room has not been initialized [${roomID}]`);
            return;
        }

        Logger.trace(`Examine room ${roomID}`);
        roomData.lastUpdated = Game.time;
        if (forceUpdate || this.shouldRefresh(11, roomData!.minUpdateOffset)) {
            Logger.trace(`Examine room[DroppedResources] ${roomID}`);
            roomData.resources = room.find(FIND_DROPPED_RESOURCES).map((value: Resource) => {
                return value.id;
            });
        }
        if (forceUpdate || this.shouldRefresh(27, roomData!.minUpdateOffset)) {
            Logger.trace(`Examine room[Tombstones] ${roomID}`);
            roomData.tombstones = room.find(FIND_TOMBSTONES).map((value: Tombstone) => {
                return value.id;
            });
        }
        if (forceUpdate || this.shouldRefresh(29, roomData!.minUpdateOffset)) {
            Logger.trace(`Examine room[ConstructionSites] ${roomID}`);
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

declare interface IRoomData {
    pid?: PID
}
declare type RoomManager_Memory = IDictionary<IRoomData>;
export const IN_RoomManager = 'RoomManager';
export const EXT_RoomView = 'RoomView';
export const EXT_RoomStructures = 'RoomStructure';
export const bundle: IPosisBundle<RoomManager_Memory> = {
    install(processRegistry: IPosisProcessRegistry, extensionRegistry: IPosisExtensionRegistry) {
        processRegistry.register(IN_RoomManager, RoomManager);
        extensionRegistry.register(EXT_RoomView, new RoomViewExtension(extensionRegistry));
        extensionRegistry.register(EXT_RoomStructures, new RoomStructuresExtension(extensionRegistry));
    },
    rootImageName: IN_RoomManager,
}
