declare interface RoomData_Memory {
    lastUpdated: number,
    sourceIDs: string[],
    mineralIDs: string[],
    owner: string
}
declare interface RoomView_Memory {
    RoomData: IDictionary<RoomData_Memory>,
    ObsQueue: string[]
}
declare var Memory: {
    RoomView: RoomView_Memory
};
if (!Memory.RoomView) {
    Memory.RoomView = {
        RoomData: {},
        ObsQueue: []
    };
}
import { BaseProcess } from "Core/BaseProcess";
import { ExtensionBase } from "Core/BaseExtension";

class RoomManager extends BaseProcess {
    run(): void {
    }
}

class RoomViewExtension extends ExtensionBase implements IRoomManagerExtension {
    protected get memory(): RoomView_Memory {
        return Memory.RoomView;
    }
    Examine(roomID: string) {
        let room = Game.rooms[roomID];
        let roomData = this.memory.RoomData[roomID] || {}
        if (!roomData.lastUpdated) {
            // Get all first time info
            roomData.sourceIDs = room.find(FIND_SOURCES)!.map((val: Source) => {
                return val.id;
            });;
            roomData.mineralIDs = room.find(FIND_MINERALS)!.map((val: Mineral) => {
                return val.id;
            });;

            // Get terrain info
        }
        roomData.lastUpdated = Game.time;
        roomData.owner = (room.controller &&
            (room.controller.owner && room.controller.owner.username) ||
            (room.controller!.reservation && room.controller!.reservation!.username)) || '';

        // Update path stuff somehow.

        this.memory.RoomData[roomID] = roomData;
    }
    View(roomID: string, updateFrequency?: number) {
        if (!updateFrequency || updateFrequency < 0) {
            updateFrequency = 10;
        }

        if (!this.memory.RoomData[roomID]) {
            if (!Game.rooms[roomID]) {
                return;
            }
            this.Examine(roomID);
        } else if (this.memory.RoomData[roomID].lastUpdated + updateFrequency < Game.time) {
            this.Examine(roomID);
        }

        return this.memory.RoomData[roomID];
    }
}

declare interface IRoomData {
    pid?: PID
}
declare type RoomManager_Memory = IDictionary<IRoomData>;
export const IN_RoomManager = 'RoomManager';
export const EXT_RoomView = 'RoomView';
export const bundle: IPosisBundle<RoomManager_Memory> = {
    install(processRegistry: IPosisProcessRegistry, extensionRegistry: IPosisExtensionRegistry) {
        processRegistry.register(IN_RoomManager, RoomManager);
        extensionRegistry.register(EXT_RoomView, new RoomViewExtension(extensionRegistry));
    },
    rootImageName: IN_RoomManager,
    makeDefaultRootMemory() {
        let startMemory: RoomManager_Memory = {};
        for (let id in Game.rooms) {
            startMemory[id] = {
            }
        }
        return startMemory;
    }
}
