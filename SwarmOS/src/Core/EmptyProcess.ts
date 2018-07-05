// CLI(CLI_Launch, PKG_EmptyProcess, {})
export const OSPackage: IPackage<MemBase> = {
    install(processRegistry: IProcessRegistry, extensionRegistry: IExtensionRegistry) {
        //processRegistry.register(PKG_EmptyProcess, EmptyProcess);
        processRegistry.register(PKG_Core, EmptyProcess)
    }
}

import { ProcessBase } from "Core/Types/ProcessBase";

const ENABLE_PROFILING = true;
class EmptyProcess extends ProcessBase<MemBase> {
    RunThread(): ThreadState {
        let start = Game.cpu.getUsed();
        try {
            if (!this.memory['count']) {
                this.memory['count'] = 0;
            }
            this.memory['count'] += 1;
            this.log.info(`${this.pid} -- Message(${this.memory['count']})`);
        } catch (ex) {
            this.log.info(`An exception occurred while trying experimental stuff (${ex})`);
        }

        if (ENABLE_PROFILING) {
            this.log.info(`Experimental CPU used (${Game.cpu.getUsed() - start})`);
        }
        return ThreadState_Done;
    }
}