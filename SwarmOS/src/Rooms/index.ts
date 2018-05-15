import { SimpleRoomPackage as SimpleOwnedRoom } from "Rooms/SimpleOwnedRoom"

export const roomBundle: IPackage<{}> = {
    install(processRegistry: IProcessRegistry, extensionRegistry: IExtensionRegistry) {
        SimpleOwnedRoom.install(processRegistry, extensionRegistry);
    }
}