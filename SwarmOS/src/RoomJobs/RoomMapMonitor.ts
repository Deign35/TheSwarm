export const OSPackage: IPackage<SpawnRegistry_Memory> = {
    install(processRegistry: IProcessRegistry, extensionRegistry: IExtensionRegistry) {
        processRegistry.register(SPKG_RoomMapMonitor, RoomMapMonitor);
    }
}

import { RoomStateActivity } from "./RoomStateActivities";
import { BasicProcess } from "Core/BasicTypes";
import { RoomMonitorBase } from "./RoomMonitors";

const SOURCE_LAYER = 'src';
const MINERAL_LAYER = 'min';
const CONTROLLER_LAYER = 'ctrl';
const SPAWN_ENERGY_LAYER = 'energy';
const REFILL_ENERGY_LAYER = 'refill';
const IMPASSABLE_LAYER = 'imp';

class RoomMapMonitor extends RoomMonitorBase<RoomMonitor_Memory> {
    //protected _cachedImpassableDistances: IDictionary<string, MapArray> = {}
    InitMonitor() {
        if (!this.room) {
            throw new Error(`Attempted to initialize RoomMapMonitor(${this.memory.rID} without access to the room`);
        }
        let sources = this.room.find(FIND_SOURCES);
        for (let i = 0; i < sources.length; i++) {
            this.roomData.distanceMaps[sources[i].id] = DistMap.CreateDistanceMap(this.room, [sources[i].pos]);
        }

        let minerals = this.room.find(FIND_MINERALS);
        for (let i = 0; i < minerals.length; i++) {
            this.roomData.distanceMaps[minerals[i].id] = DistMap.CreateDistanceMap(this.room, [minerals[i].pos]);
        }

        this.roomData.distanceMaps[this.room.controller!.id] = DistMap.CreateDistanceMap(this.room, [this.room.controller!.pos]);
        this.GenerateContainerMap();
        this.GenerateSpawnEnergyMap();
        this.GenerateImpassableMap();

        return true;
    }

    GenerateImpassableMap() {
        let impassableMap = new Array(ROOM_ARRAY_SIZE).fill(1);
        let structures = this.room!.find(FIND_STRUCTURES);
        for (let i = 0; i < structures.length; i++) {
            if (structures[i].structureType == STRUCTURE_CONTAINER ||
                structures[i].structureType == STRUCTURE_PORTAL ||
                structures[i].structureType == STRUCTURE_RAMPART ||
                structures[i].structureType == STRUCTURE_ROAD) {
                continue;
            }
            impassableMap[structures[i].pos.y * ROOM_WIDTH + structures[i].pos.x] = 0;
        }

        // (TODO): Should add that wall terrain also equal 0.
        this.roomData.distanceMaps[IMPASSABLE_LAYER] = impassableMap;
    }

    GenerateSpawnEnergyMap() {
        let spawnEnergyPositions = this.room!.find(FIND_STRUCTURES, {
            filter: (struct) => {
                return struct.structureType == STRUCTURE_SPAWN ||
                    struct.structureType == STRUCTURE_EXTENSION;
            }
        }).map((struct) => {
            return struct.pos;
        })
        this.roomData.distanceMaps[SPAWN_ENERGY_LAYER] = DistMap.CreateDistanceMap(this.room!, spawnEnergyPositions);
    }
    GenerateContainerMap() {
        let containerPositions = this.room!.find(FIND_STRUCTURES, {
            filter: (struct) => {
                return struct.structureType == STRUCTURE_CONTAINER ||
                    struct.structureType == STRUCTURE_STORAGE ||
                    struct.structureType == STRUCTURE_TERMINAL;
            }
        }).map((struct) => {
            return struct.pos
        });
        this.roomData.distanceMaps[REFILL_ENERGY_LAYER] = DistMap.CreateDistanceMap(this.room!, containerPositions);
    }

    MonitorRoom(): ThreadState {
        if (this.shouldRefresh(241)) {
            this.GenerateContainerMap();
        }
        if (this.shouldRefresh(473)) {
            this.GenerateSpawnEnergyMap();
        }
        /*
        if (this.shouldRefresh(31)) {
            this.GenerateImpassableMap();
            // (TODO): These need to somehow be made available 
            this._cachedImpassableDistances[SOURCE_LAYER] = DistMap.MultiplyDistanceMaps(this.memory.rID, [SOURCE_LAYER, IMPASSABLE_LAYER]);
            this._cachedImpassableDistances[MINERAL_LAYER] = DistMap.MultiplyDistanceMaps(this.memory.rID, [MINERAL_LAYER, IMPASSABLE_LAYER]);
            this._cachedImpassableDistances[CONTROLLER_LAYER] = DistMap.MultiplyDistanceMaps(this.memory.rID, [CONTROLLER_LAYER, IMPASSABLE_LAYER]);
            this._cachedImpassableDistances[SPAWN_ENERGY_LAYER] = DistMap.MultiplyDistanceMaps(this.memory.rID, [SPAWN_ENERGY_LAYER, IMPASSABLE_LAYER]);
            this._cachedImpassableDistances[REFILL_ENERGY_LAYER] = DistMap.MultiplyDistanceMaps(this.memory.rID, [REFILL_ENERGY_LAYER, IMPASSABLE_LAYER]);
        }*/

        this.memory.lu = Game.time;
        return ThreadState_Done;
    }
    /*EndTick() {
        try {
            let sources = this.room.find(FIND_SOURCES);
            let maps = [];
            for (let i = 0; i < sources.length; i++) {
                maps.push(this.roomData.distanceMaps[sources[i].id]);
            }
            let displayVal = DistMap.MaxDistanceMaps(maps);
            for (let i = 0; i < displayVal.length; i++) {
                this.VisualizePosition(i % 50, Math.floor(i / 50), displayVal[i]);
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
        this.room.visual.text('' + val, x, y + 0.2);
    }

    protected convertValToColor(val: number): string {
        let percentage = val / 75;
        let blue = Math.floor(0xff * percentage);
        let red = Math.floor(0xff * (1 - percentage)) * 0x010000;

        return `#${(red + blue).toString(16)}`;
    }*/
}

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