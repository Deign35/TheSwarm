declare var Memory: {
    mapDirectory: {
        [id: string]: IDictionary<string, MapArray>
    }
}
import { ExtensionBase } from "Core/BasicTypes";

export const OSPackage: IPackage<FlagExtensionsMemory> = {
    install(processRegistry: IProcessRegistry, extensionRegistry: IExtensionRegistry) {
        extensionRegistry.register(EXT_MapDirectory, new MapDirectory(extensionRegistry));
    }
}

class MapDirectory extends ExtensionBase implements IMapDirectory{
    get memory(): IDictionary<RoomID, IDictionary<string, MapArray>> {
        if (!Memory.mapDirectory) {
            this.log.warn(`Initializing MapDirectory memory`);
            Memory.mapDirectory = {}
        }
        return Memory.mapDirectory;
    }

    protected get mapDirectory() {
        return this.memory.mapDirectory;
    }

    CreateMapForRoom(roomID: RoomID, mapID: string, startPositions: RoomPosition[]): boolean {
        if (Game.rooms[roomID] !== undefined) {
            this.mapDirectory[roomID][mapID] = DistMap.CreateDistanceMap(Game.rooms[roomID], startPositions);
            return true;
        }
        return false;
    }
    GetMap(roomID: RoomID, mapID: string): MapArray | undefined {
        if (!this.mapDirectory[roomID]) {
            return;
        }
        return this.mapDirectory[roomID][mapID];
    }
}
