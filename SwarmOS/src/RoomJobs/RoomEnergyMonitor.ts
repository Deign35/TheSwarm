import { RoomStateActivity } from "./RoomStateActivities";

const SOURCE_LAYER = 'src';
const CONTROLLER_LAYER = 'ctrl';
const SPAWN_ENERGY_LAYER = 'energy';
const REFILL_ENERGY_LAYER = 'refill';

class RoomEnergyMonitor extends RoomStateActivity<RoomEnergyMonitor_Memory> {
    protected get room(): Room {
        return super.room!;
    }

    PrepTick() {
        if (this.memory.nb) {
            let sources = this.room.find(FIND_SOURCES).map((source) => {
                return source.pos;
            })
            this.roomData.distanceMaps[SOURCE_LAYER] = this.roomView.CreateDistanceMap(this.room, sources);
            this.roomData.distanceMaps[CONTROLLER_LAYER] = this.roomView.CreateDistanceMap(this.room, [this.room.controller!.pos]);
            delete this.memory.nb;
        }
        if (this.shouldRefresh(241) || this.memory.lu == 0) {
            let positions = this.room.find(FIND_STRUCTURES, {
                filter: (struct) => {
                    return struct.structureType == STRUCTURE_CONTAINER ||
                        struct.structureType == STRUCTURE_STORAGE ||
                        struct.structureType == STRUCTURE_TERMINAL;
                }
            }).map((struct) => {
                return struct.pos
            });
            this.roomData.distanceMaps[REFILL_ENERGY_LAYER] = this.roomView.CreateDistanceMap(this.room, positions);
        }
        if (this.shouldRefresh(473) || this.memory.lu == 0) {
            let positions = this.room.find(FIND_STRUCTURES, {
                filter: (struct) => {
                    return struct.structureType == STRUCTURE_SPAWN ||
                        struct.structureType == STRUCTURE_EXTENSION;
                }
            }).map((struct) => {
                return struct.pos;
            })
            this.roomData.distanceMaps[SPAWN_ENERGY_LAYER] = this.roomView.CreateDistanceMap(this.room, positions);
        }

        this.memory.lu = Game.time;
    }

    RunThread(): ThreadState {
        return ThreadState_Done;
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