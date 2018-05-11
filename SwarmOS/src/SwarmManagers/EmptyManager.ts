/**
 * How to use:
 * Copy/Paste this file
 * Then do a find and replace for
 * '___Empty___'
 * 
 * Replace with whatever name you want.
 * 
 * You now have a ${'___Empty___'}Manager to implement
 */
declare type I___Empty___Data_Memory = Dictionary;

declare var Memory: {
    ___Empty___Data: I___Empty___Data_Memory
}

import { ProcessBase, ExtensionBase } from "Core/BasicTypes";

export const IN____Empty___Manager = '___Empty___Manager';
export const IN____Empty___Extensions = '___Empty___Extensions';
export const bundle: IPosisBundle<I___Empty___Data_Memory> = {
    install(processRegistry: IPosisProcessRegistry, extensionRegistry: IPosisExtensionRegistry) {
        processRegistry.register(IN____Empty___Manager, ___Empty___Manager);
        extensionRegistry.register(IN____Empty___Extensions, ___Empty___Extension);
    },
    rootImageName: IN____Empty___Manager
}
const IN____Empty___Manager_LogContext: LogContext = {
    logID: IN____Empty___Manager,
    logLevel: LOG_DEBUG
}

class ___Empty___Manager extends ProcessBase {
    protected OnLoad(): void { }
    constructor(protected context: IPosisProcessContext) {
        super(context);
        Logger.CreateLogContext(IN____Empty___Manager_LogContext);
    }
    protected get memory() {
        return Memory.___Empty___Data;
    }
    protected get log() {
        return this._logger;
    }
    private _logger: ILogger = {
        alert: (message: (string | (() => string))) => { Logger.alert(message, IN____Empty___Manager); },
        debug: (message: (string | (() => string))) => { Logger.debug(message, IN____Empty___Manager); },
        error: (message: (string | (() => string))) => { Logger.error(message, IN____Empty___Manager); },
        fatal: (message: (string | (() => string))) => { Logger.fatal(message, IN____Empty___Manager); },
        info: (message: (string | (() => string))) => { Logger.info(message, IN____Empty___Manager); },
        trace: (message: (string | (() => string))) => { Logger.trace(message, IN____Empty___Manager); },
        warn: (message: (string | (() => string))) => { Logger.warn(message, IN____Empty___Manager); },
        CreateLogContext: Logger.CreateLogContext,
        DumpLogToConsole: Logger.DumpLogToConsole
    }

    handleMissingMemory() {
        if (!Memory.___Empty___Data) {
            Memory.___Empty___Data = {};
        }
        return Memory.___Empty___Data;
    }
    executeProcess(): void {
        this.log.warn(`${IN____Empty___Manager} has not been implemented.`);
    }
}

class ___Empty___Extension extends ExtensionBase {
    protected get memory(): I___Empty___Data_Memory {
        return Memory.___Empty___Data;
    }
}
