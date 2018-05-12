import { bundle as BasicOwnedRoom } from "Rooms/BasicOwnedRoom"

export const roomBundle: IPosisBundle<{}> = {
    install(processRegistry: IPosisProcessRegistry, extensionRegistry: IPosisExtensionRegistry) {
        BasicOwnedRoom.install(processRegistry, extensionRegistry);
    }
}