export const OSPackage: IPackage<MemBase> = {
    install(processRegistry: IProcessRegistry, extensionRegistry: IExtensionRegistry) {
        processRegistry.register(PKG_CLIProcessor, CLIProcessor)
    }
}
declare interface CLI_Memory extends MemBase { }
import { ProcessBase } from "Core/Types/ProcessTypes";
import { profile } from "Tools/Profiler";

declare var Memory: {
    CLI: any
}

global['CLI'] = function (command: CLI_Command, ...args: any[]) {
    Memory.CLI.push({ command, args });
    return OK;
}

@profile
class CLIProcessor extends ProcessBase {
    RunThread(): ThreadState {
        if (!Memory.CLI) {
            Memory.CLI = []
        }
        let cmd = Memory.CLI.shift();
        if (cmd) {
            try {
                this.log.info(`Processing ${cmd.command}(${JSON.stringify(cmd.args)})`)
                switch (cmd.command) {
                    case (CLI_Launch):
                        if (cmd.args && cmd.args.length == 2) {

                            this.kernel.startProcess(cmd.args[0], cmd.args[1]);
                        }
                        break;
                    default:
                        this.log.info(`CLI Command(${cmd.command}) with args {${JSON.stringify(cmd.args)}}`);
                        break;
                }

            } catch (ex) {
                this.log.warn(`CLI Command(${cmd.command}) failed with args {${JSON.stringify(cmd.args)}}`);
            }
        }

        return ThreadState_Done;
    }
}