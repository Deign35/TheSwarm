export const OSPackage: IPackage<MemBase> = {
    install(processRegistry: IProcessRegistry, extensionRegistry: IExtensionRegistry) {
        processRegistry.register(PKG_CLIProcessor, CLIProcessor)
    }
}
declare interface CLI_Memory extends MemBase { }
import { ProcessBase } from "Core/Types/ProcessTypes";
import { profile } from "Tools/Profiler";

@profile
class CLIProcessor extends ProcessBase {
    RunThread(): ThreadState {
        try {
            let file = this.memFolder.CreateFile('test.dat');
        } catch (ex) {
            this.log.info(`An exception occurred while trying experimental stuff (${ex})`);
        }
        return ThreadState_Done;
    }
}