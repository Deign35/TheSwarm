export const OSPackage: IPackage<SpawnRegistry_Memory> = {
    install(processRegistry: IProcessRegistry, extensionRegistry: IExtensionRegistry) {
        processRegistry.register(SPKG_RoomMapMonitor, RoomEnergyMonitor);
    }
}

import { RoomStateActivity } from "./RoomStateActivities";
import { BasicProcess } from "Core/BasicTypes";

const SOURCE_LAYER = 'src';
const MINERAL_LAYER = 'min';
const CONTROLLER_LAYER = 'ctrl';
const SPAWN_ENERGY_LAYER = 'energy';
const REFILL_ENERGY_LAYER = 'refill';
const IMPASSABLE_LAYER = 'imp';

const ROOM_HEIGHT = 50;
const ROOM_WIDTH = 50;
const ROOM_ARRAY_SIZE = ROOM_HEIGHT * ROOM_WIDTH;
class RoomEnergyMonitor extends BasicProcess<RoomStateMap_Memory> {
    private _room!: Room;
    protected get room(): Room {
        return this._room;
    }
    private _roomData!: RoomState;
    protected get roomData() {
        return this._roomData;
    }

    protected _cachedImpassableDistances: IDictionary<string, number[]> = {}
    PrepTick() {
        this._room = Game.rooms[this.memory.rID];
        this._roomData = this.roomView.GetRoomData(this.memory.rID)!;
        if (!this._roomData) {
            throw new Error(`Room monitor is missing roomdata ${this.memory.rID}`);
        }
        if (this.memory.nb) {
            let sources = this.room.find(FIND_SOURCES).map((source) => {
                return source.pos;
            })
            this.roomData.distanceMaps[SOURCE_LAYER] = this.roomView.CreateDistanceMap(this.room, sources);
            let minerals = this.room.find(FIND_MINERALS).map((mineral) => {
                return mineral.pos;
            })
            this.roomData.distanceMaps[MINERAL_LAYER] = this.roomView.CreateDistanceMap(this.room, minerals);
            this.roomData.distanceMaps[CONTROLLER_LAYER] = this.roomView.CreateDistanceMap(this.room, [this.room.controller!.pos]);
            this.GenerateContainerMap();
            this.GenerateSpawnEnergyMap();
            this.GenerateImpassableMap();
            delete this.memory.nb;
        }
    }

    GenerateImpassableMap() {
        let impassableMap = new Array(ROOM_ARRAY_SIZE).fill(1);
        let structures = this.room.find(FIND_STRUCTURES);
        for (let i = 0; i < structures.length; i++) {
            if (structures[i].structureType == STRUCTURE_CONTAINER ||
                structures[i].structureType == STRUCTURE_PORTAL ||
                structures[i].structureType == STRUCTURE_RAMPART ||
                structures[i].structureType == STRUCTURE_ROAD) {
                continue;
            }
            impassableMap[structures[i].pos.y * 50 + structures[i].pos.x] = 0;
        }

        this.roomData.distanceMaps[IMPASSABLE_LAYER] = impassableMap;
    }

    GenerateSpawnEnergyMap() {
        let spawnEnergyPositions = this.room.find(FIND_STRUCTURES, {
            filter: (struct) => {
                return struct.structureType == STRUCTURE_SPAWN ||
                    struct.structureType == STRUCTURE_EXTENSION;
            }
        }).map((struct) => {
            return struct.pos;
        })
        this.roomData.distanceMaps[SPAWN_ENERGY_LAYER] = this.roomView.CreateDistanceMap(this.room, spawnEnergyPositions);
    }
    GenerateContainerMap() {
        let containerPositions = this.room.find(FIND_STRUCTURES, {
            filter: (struct) => {
                return struct.structureType == STRUCTURE_CONTAINER ||
                    struct.structureType == STRUCTURE_STORAGE ||
                    struct.structureType == STRUCTURE_TERMINAL;
            }
        }).map((struct) => {
            return struct.pos
        });
        this.roomData.distanceMaps[REFILL_ENERGY_LAYER] = this.roomView.CreateDistanceMap(this.room, containerPositions);
    }

    RunThread(): ThreadState {
        if (this.shouldRefresh(241)) {
            this.GenerateContainerMap();
        }
        if (this.shouldRefresh(473)) {
            this.GenerateSpawnEnergyMap();
        }
        if (this.shouldRefresh(31)) {
            this.GenerateImpassableMap();
            // (TODO): These need to somehow be made available 
            this._cachedImpassableDistances[SOURCE_LAYER] = this.roomView.MultiplyDistanceMaps(this.memory.rID, [SOURCE_LAYER, IMPASSABLE_LAYER]);
            this._cachedImpassableDistances[MINERAL_LAYER] = this.roomView.MultiplyDistanceMaps(this.memory.rID, [MINERAL_LAYER, IMPASSABLE_LAYER]);
            this._cachedImpassableDistances[CONTROLLER_LAYER] = this.roomView.MultiplyDistanceMaps(this.memory.rID, [CONTROLLER_LAYER, IMPASSABLE_LAYER]);
            this._cachedImpassableDistances[SPAWN_ENERGY_LAYER] = this.roomView.MultiplyDistanceMaps(this.memory.rID, [SPAWN_ENERGY_LAYER, IMPASSABLE_LAYER]);
            this._cachedImpassableDistances[REFILL_ENERGY_LAYER] = this.roomView.MultiplyDistanceMaps(this.memory.rID, [REFILL_ENERGY_LAYER, IMPASSABLE_LAYER]);
        }

        this.memory.lu = Game.time;
        return ThreadState_Done;
    }

    EndTick() {
        try {
            let averaged = this.roomView.AverageDistanceMaps('sim', [SOURCE_LAYER, SPAWN_ENERGY_LAYER, REFILL_ENERGY_LAYER])
            for (let i = 0; i < 2500; i++) {
                this.VisualizePosition(i % 50, Math.floor(i / 50), averaged[i]);
            }
        } catch (ex) {
            console.log(JSON.stringify(ex));
        }
    }

    VisualizePosition(x: number, y: number, val: number) {
        let fillVal = this.convertValToColor(val);
        this.room.visual.rect(x - 0.4, y - 0.4, 0.8, 0.8, {
            fill: fillVal
        });
        this.room.visual.text('' + val, x, y);
    }
    protected shouldRefresh(frequency: number): boolean {
        return (Game.time + this.roomData.minUpdateOffset) % frequency == 0;
    }

    protected convertValToColor(val: number): string {
        let percentage = val / 33;
        let blue = Math.floor(0xff * percentage);
        let red = Math.floor(0xff * (1 - percentage)) * 0x010000;

        return `#${(red + blue).toString(16)}`;
    }
}

const HIGH_BLUE = 0x0000ff;
const HIGH_RED = 0xff0000;
declare interface RoomEnergyState {
    withdraw: { [id in ObjectID]: RoomEnergyNode };
    transfer: { [id in ObjectID]: RoomEnergyNode };

    paths: RoomEnergyPath[];
}
declare interface RoomEnergyNode {
    x: number;
    y: number;
    res: number;    // Reserved amount for this node and can only be withdrawn for a single action.
    exp: number;    // Number currently being delivered.
    amt: number;    // Amount in the node.
}

declare interface RoomEnergyPath {
    wNode: RoomEnergyNode;
    tNode: RoomEnergyNode;
    path: PathStep[];
}

declare interface RoomEnergyRequest {
    x: number;
    y: number;
    amt: number;
    pid?: PID;
}