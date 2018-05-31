export const OSPackage: IPackage<SpawnRegistry_Memory> = {
    install(processRegistry: IProcessRegistry, extensionRegistry: IExtensionRegistry) {
        processRegistry.register(SPKG_SpawnActivity, RoomActivity);
    }
}

import { SlimProcess } from "Core/BasicTypes";

class RoomActivity extends SlimProcess<RoomActivity_Memory> {
    @extensionInterface(EXT_RoomView)
    protected View!: IRoomDataExtension;

    RunThread(): ThreadState {

        return ThreadState_Done;
    }
}