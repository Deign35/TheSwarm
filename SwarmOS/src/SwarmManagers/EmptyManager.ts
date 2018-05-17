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
declare interface I___Empty___Data_Memory extends SDictionary<any> { }

declare var Memory: {
    ___Empty___Data: I___Empty___Data_Memory
}

import { BasicProcess, ExtensionBase } from "Core/BasicTypes";

export const IN____Empty___Manager = '___Empty___Manager';
export const IN____Empty___Extensions = '___Empty___Extensions';
export const bundle: IPackage<I___Empty___Data_Memory> = {
    install(processRegistry: IProcessRegistry, extensionRegistry: IExtensionRegistry) {
        processRegistry.register(IN____Empty___Manager, ___Empty___Manager);
        extensionRegistry.register(IN____Empty___Extensions, ___Empty___Extension);
    }
}
const IN____Empty___Manager_LogContext: LogContext = {
    logID: IN____Empty___Manager,
    logLevel: LOG_DEBUG
}

class ___Empty___Manager extends BasicProcess<I___Empty___Data_Memory> {
    protected get memory() {
        return Memory.___Empty___Data;
    }

    protected get logID() {
        return IN____Empty___Manager_LogContext.logID
    }
    protected get logLevel(): LogLevel {
        return IN____Empty___Manager_LogContext.logLevel!;
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

class ___Empty___Extension extends ExtensionBase { }
