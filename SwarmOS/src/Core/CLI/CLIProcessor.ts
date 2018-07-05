export const OSPackage: IPackage<MemBase> = {
    install(processRegistry: IProcessRegistry, extensionRegistry: IExtensionRegistry) {
        processRegistry.register(PKG_CLIProcessor, CLIProcessor)
    }
}
declare interface CLI_Memory extends MemBase {

}
import { ProcessBase } from "Core/Types/ProcessTypes";
import { profile } from "Tools/Profiler";
const ENABLE_PROFILING = true;

@profile
class CLIProcessor extends ProcessBase<CLI_Memory> {
    RunThread(): ThreadState {
        try {
            this.log.alert(`CLI Tick: ${Game.time}`);
        } catch (ex) {
            this.log.info(`An exception occurred while trying experimental stuff (${ex})`);
        }
        return ThreadState_Done;
    }
}