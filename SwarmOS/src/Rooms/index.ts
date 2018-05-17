import { OSPackage as BasicOwnedRoom } from "Rooms/BasicOwnedRoom"

export const roomBundle: IPackage<{}> = {
    install(processRegistry: IProcessRegistry, extensionRegistry: IExtensionRegistry) {
        BasicOwnedRoom.install(processRegistry, extensionRegistry);
    }
}