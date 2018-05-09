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

import { BaseProcess } from "Core/ProcessRegistry";
import { ExtensionBase } from "Core/ExtensionRegistry";

export const IN____Empty___Manager = '___Empty___Manager';
export const bundle: IPosisBundle<I___Empty___Data_Memory> = {
    install(processRegistry: IPosisProcessRegistry, extensionRegistry: IPosisExtensionRegistry) {
        processRegistry.register(IN____Empty___Manager, ___Empty___Manager);
    },
    rootImageName: IN____Empty___Manager
}

class ___Empty___Manager extends BaseProcess {
    protected get memory() {
        return Memory.___Empty___Data;
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
