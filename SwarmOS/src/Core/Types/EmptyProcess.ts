// CLI(CLI_Launch, PKG_EmptyProcess, {})
export const OSPackage: IPackage<MemBase> = {
    install(processRegistry: IProcessRegistry, extensionRegistry: IExtensionRegistry) {
        processRegistry.register(PKG_EmptyProcess, EmptyProcess)
    }
}

import { ProcessBase } from "Core/Types/ProcessTypes";

const ENABLE_PROFILING = true;
class EmptyProcess extends ProcessBase {
    RunThread(): ThreadState {
        let start = Game.cpu.getUsed();
        try {
            this.log.info(`[${Game.time}] -- ${this.pid} -- Message()`);
        } catch (ex) {
            this.log.info(`An exception occurred while trying experimental stuff (${ex})`);
        }

        if (ENABLE_PROFILING) {
            this.log.info(`Experimental CPU used (${Game.cpu.getUsed() - start})`);
        }
        return ThreadState_Done;
    }
}