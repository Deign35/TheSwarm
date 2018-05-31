export const OSPackage: IPackage<SpawnRegistry_Memory> = {
    install(processRegistry: IProcessRegistry, extensionRegistry: IExtensionRegistry) {
        processRegistry.register(PKG_EmptyProcess, EmptyProcess);
    }
}

import { BasicProcess } from "Core/BasicTypes";

const PKG_EmptyProcess_LogContext: LogContext = {
    logID: PKG_EmptyProcess,
    logLevel: LOG_TRACE
}

const ENABLE_PROFILING = false;
class EmptyProcess extends BasicProcess<RoomActivity_Memory> {
    @extensionInterface(EXT_RoomView)
    protected View!: IRoomDataExtension;
    @extensionInterface(EXT_SpawnRegistry)
    protected spawnRegistry!: ISpawnRegistryExtensions;
    @extensionInterface(EXT_CreepRegistry)
    protected creepRegistry!: ICreepRegistryExtensions;

    RunThread(): ThreadState {
        let start = Game.cpu.getUsed();
        try {

        } catch (ex) {
            this.log.info(`An exception occurred while trying experimental stuff (${ex})`);
        }

        if (ENABLE_PROFILING) {
            this.log.info(`Experimental CPU used (${Game.cpu.getUsed() - start})`);
        }
        return ThreadState_Done;
    }
}