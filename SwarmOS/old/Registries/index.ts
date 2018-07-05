import { OSPackage as MapDirectory } from "Registries/MapDirectory";
import { BasicProcess } from "Core/BasicTypes";
class SwarmManager extends BasicProcess<any> {
    RunThread(): ThreadState {
        if (!this.memory.count) {
            this.memory.count = 0;
        }
        this.memory.count++;
        this.log.info(`Ping(${this.memory.count})`);
        return ThreadState_Done;
    }
}

export const RegistriesPackage: IPackage<MemBase> = {
    install(processRegistry: IProcessRegistry, extensionRegistry: IExtensionRegistry) {
        MapDirectory.install(processRegistry, extensionRegistry);
        processRegistry.register(PKG_SwarmManager, SwarmManager);
    },
}