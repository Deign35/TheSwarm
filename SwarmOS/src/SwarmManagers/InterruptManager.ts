declare interface InterruptMemory {
    [id: string]: {
        subscribers: PID[]
    }
}

import { ProcessBase, ExtensionBase } from "Core/BasicTypes";

export const bundle: IPackage<InterruptMemory> = {
    install(processRegistry: IProcessRegistry, extensionRegistry: IExtensionRegistry) {
        processRegistry.register(PKG_InterruptManager, InterruptManager);
    },
    rootImageName: PKG_InterruptManager
}
const PKG_InterruptManager_LogContext: LogContext = {
    logID: PKG_InterruptManager,
    logLevel: LOG_DEBUG
}

class InterruptManager extends ProcessBase {
    protected OnLoad(): void {
        let interruptionExtension = new InterruptExtension(this.extensions, this.memory);
        this.extensions.register(EXT_Interrupt, interruptionExtension);
    }
    constructor(protected context: IProcessContext) {
        super(context);
        Logger.CreateLogContext(PKG_InterruptManager_LogContext);
    }
    protected get memory(): InterruptMemory {
        return super.memory
    }
    protected get log() {
        return this._logger;
    }
    private _logger: ILogger = {
        alert: (message: (string | (() => string))) => { Logger.alert(message, PKG_InterruptManager); },
        debug: (message: (string | (() => string))) => { Logger.debug(message, PKG_InterruptManager); },
        error: (message: (string | (() => string))) => { Logger.error(message, PKG_InterruptManager); },
        fatal: (message: (string | (() => string))) => { Logger.fatal(message, PKG_InterruptManager); },
        info: (message: (string | (() => string))) => { Logger.info(message, PKG_InterruptManager); },
        trace: (message: (string | (() => string))) => { Logger.trace(message, PKG_InterruptManager); },
        warn: (message: (string | (() => string))) => { Logger.warn(message, PKG_InterruptManager); },
        CreateLogContext: Logger.CreateLogContext,
        DumpLogToConsole: Logger.DumpLogToConsole
    }

    executeProcess(): void {
    }
}

class InterruptExtension extends ExtensionBase {
    constructor(protected extensionRegistry: IExtensionRegistry, mem: InterruptMemory) {
        super(extensionRegistry);
        this._memory = mem;
    }
    @posisInterface(EXT_Sleep)
    protected sleeper!: IKernelSleepExtension

    protected get memory(): InterruptMemory {
        return this._memory;
    }
    private _memory: InterruptMemory;

    IsSubscribed(id: string, pid: PID) {
        if (this.memory[id]) {
            for (let i = 0; i < this.memory[id].subscribers.length; i++) {
                if (this.memory[id].subscribers[id] == pid) {
                    return true;
                }
            }
        }

        return false;
    }

    Subscribe(id: string, pid: PID) {
        if (!this.memory[id]) {
            this.memory[id] = {
                subscribers: []
            }
        }
        if (!this.IsSubscribed(id, pid)) {
            this.memory[id].subscribers.push(pid);
        }
    }
    UnSubscribe(id: string, pid: PID) {
        if (this.memory[id]) {
            for (let i = 0; i < this.memory[id].subscribers.length; i++) {
                if (this.memory[id].subscribers[i] == pid) {
                    this.memory[id].subscribers.splice(i, 1);
                    return;
                }
            }
        }
    }

    Notify(id: string) {
        if (this.memory[id]) {
            for (let i = 0; i < this.memory[id].subscribers.length; i++) {
                this.sleeper.wake(this.memory[id].subscribers[i]);
            }
        }
    }
}
