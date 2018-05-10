import { bundle as FirstRoom } from "Rooms/FirstRoom"

export const roomBundle: IPosisBundle<{}> = {
    install(processRegistry: IPosisProcessRegistry, extensionRegistry: IPosisExtensionRegistry) {
        FirstRoom.install(processRegistry, extensionRegistry);
    }
}