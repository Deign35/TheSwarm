// CLI(CLI_Launch, PKG_EmptyProcess, {})
export const OSPackage: IPackage<SpawnRegistry_Memory> = {
    install(processRegistry: IProcessRegistry, extensionRegistry: IExtensionRegistry) {
        //processRegistry.register(PKG_EmptyProcess, EmptyProcess);
    }
}

import { BasicProcess } from "Core/BasicTypes";

const ENABLE_PROFILING = true;
class EmptyProcess extends BasicProcess<MemBase> {
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