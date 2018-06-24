export const OSPackage: IPackage<SpawnRegistry_Memory> = {
    install(processRegistry: IProcessRegistry, extensionRegistry: IExtensionRegistry) {
        processRegistry.register(SPKG_RoomMapMonitor, RoomEnergyMonitor);
    }
}

import { RoomStateActivity } from "./RoomStateActivities";
import { BasicProcess } from "Core/BasicTypes";

const SOURCE_LAYER = 'src';
const CONTROLLER_LAYER = 'ctrl';
const SPAWN_ENERGY_LAYER = 'energy';
const REFILL_ENERGY_LAYER = 'refill';

class RoomEnergyMonitor extends BasicProcess<RoomStateMap_Memory> {
    private _room!: Room;
    protected get room(): Room {
        return this._room;
    }
    private _roomData!: RoomState;
    protected get roomData() {
        return this._roomData;
    }
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
            this.roomData.distanceMaps[CONTROLLER_LAYER] = this.roomView.CreateDistanceMap(this.room, [this.room.controller!.pos]);
            this.GenerateContainerMap();
            this.GenerateSpawnEnergyMap();
            delete this.memory.nb;
        }
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

        this.memory.lu = Game.time;
        return ThreadState_Done;
    }

    EndTick() {
        try {
            let averaged = this.roomView.AverageDistanceMaps('sim', [SOURCE_LAYER, SPAWN_ENERGY_LAYER, REFILL_ENERGY_LAYER])
            for (let i = 0; i < 2500; i++) {
                this.room.visual.text('' + averaged[i], i % 50, Math.floor(i / 50));
            }
        } catch (ex) {
            console.log(JSON.stringify(ex));
        }
    }
    protected shouldRefresh(frequency: number): boolean {
        return (Game.time + this.roomData.minUpdateOffset) % frequency == 0;
    }
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