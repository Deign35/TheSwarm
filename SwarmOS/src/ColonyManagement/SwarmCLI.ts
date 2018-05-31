declare var Memory: {
    CLI: SwarmCLIMemory
}

export const OSPackage: IPackage<CreepRegistry_Memory> = {
    install(processRegistry: IProcessRegistry, extensionRegistry: IExtensionRegistry) {
        processRegistry.register(PKG_SwarmCLI, SwarmCLI);
    }
}

import { BasicProcess } from "Core/BasicTypes";

class SwarmCLI extends BasicProcess<SwarmCLIMemory> {
    protected get memory(): SwarmCLIMemory {
        if (!Memory.CLI) {
            this.log.warn(`Initializing Command Line Interface memory`);
            Memory.CLI = {
                commands: []
            }
        }
        return Memory.CLI;
    }
    protected get commands() {
        return this.memory.commands;
    }
    RunThread(): ThreadState {
        let cmd = this.commands.shift();
        if (cmd) {
            try {
                this.log.info(`Processing CLI_${cmd.command}(${JSON.stringify(cmd.args)})`)
                switch (cmd.command) {
                    case (CLI_Launch):
                        if (cmd.args && cmd.args.length == 2) {
                            this.LaunchProcess(cmd.args[0], cmd.args[1]);
                        }
                        break;
                    case (CLI_ChangeFlag):
                        if (cmd.args) {
                            if (cmd.args.length == 2) {
                                cmd.args.push(undefined);
                            }
                            if (cmd.args.length == 3) {
                                cmd.args.push(undefined);
                            }
                            this.ChangeFlagColors(cmd.args[0], cmd.args[1], cmd.args[2], cmd.args[3]);
                        }
                    default:
                        break;
                }

            } catch (ex) {
                this.log.warn(`CLI Command(${cmd.command}) failed with args {${JSON.stringify(cmd.args)}} `);
            }
        }
        return this.commands.length > 0 ? ThreadState_Active : ThreadState_Done;
    }
    LaunchProcess(pkg: ScreepsPackage, startMem: any) {
        try {
            this.kernel.startProcess(pkg, startMem);
        } catch (ex) {
            this.log
        }
    }
    ChangeFlagColors(priA: ColorConstant, priB: ColorConstant, secA?: ColorConstant, secB?: ColorConstant) {
        let flagIDs = Object.keys(Game.flags);
        for (let i = 0; i < flagIDs.length; i++) {
            let flag = Game.flags[flagIDs[i]];
            this.log.info(`Checking flag(${flag.name}`);
            if (flag.color == priA) {
                if (!secA || flag.secondaryColor == secA) {
                    this.log.info(`PrimaryMatch`)
                    if (secB) {
                        flag.setColor(priB, secB);
                    } else {
                        flag.setColor(priB, flag.secondaryColor);
                    }
                }
            }
        }
    }
}

global['CLI'] = function (command: CLI_Command, ...args: any[]) {
    Memory.CLI.commands.push({ command, args });
    return OK;
}