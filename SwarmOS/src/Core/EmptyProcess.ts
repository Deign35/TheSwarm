// CLI(CLI_Launch, PKG_EmptyProcess, {})
export const OSPackage: IPackage<MemBase> = {
    install(processRegistry: IProcessRegistry, extensionRegistry: IExtensionRegistry) {
        processRegistry.register(PKG_EmptyProcess, EmptyProcess)
    }
}

import { ProcessBase } from "Core/Types/ProcessBase";

const ENABLE_PROFILING = true;
class EmptyProcess extends ProcessBase<MemBase> {
    private get count() {
        if (!this.memory['count']) {
            this.memory['count'] = 0;
        }
        return this.memory['count'];
    }
    private set count(num) {
        this.memory['count'] = num;
    }
    RunThread(): ThreadState {
        let start = Game.cpu.getUsed();
        try {
            this.count++;
            this.log.info(`[${Game.time}] -- ${this.pid} -- Message(${this.count})`);
            if (this.count > 25) {
                this.EndProcess('Count has completed');
            }
        } catch (ex) {
            this.log.info(`An exception occurred while trying experimental stuff (${ex})`);
        }

        if (ENABLE_PROFILING) {
            this.log.info(`Experimental CPU used (${Game.cpu.getUsed() - start})`);
        }
        return ThreadState_Done;
    }
}