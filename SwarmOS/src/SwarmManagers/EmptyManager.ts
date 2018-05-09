/**
 * How to use:
 * Copy/Paste this file
 * Then do a find and replace for
 * '___Empty___'
 * 
 * Replace with whatever name you want
 */

declare var Memory: {
    ___Empty___Data: any
}

import { BaseProcess } from "Core/ProcessRegistry";
import { ExtensionBase } from "Core/ExtensionRegistry";

export const IN____Empty___Manager = '___Empty___Manager';
export const bundle: IPosisBundle<IDictionary<RoomData_Memory>> = {
    install(processRegistry: IPosisProcessRegistry, extensionRegistry: IPosisExtensionRegistry) {
        processRegistry.register(IN____Empty___Manager, ___Empty___Manager);
    },
    rootImageName: IN____Empty___Manager,
    makeDefaultRootMemory: () => {
        if (!Memory.___Empty___Data) {
            Memory.___Empty___Data = {};
        }

        return Memory.___Empty___Data;
    }
}

class ___Empty___Manager extends BaseProcess {
    protected get memory() {
        return Memory.___Empty___Data;
    }
    executeProcess(): void {

    }
}

class ___Empty___Extension extends ExtensionBase {
    protected get memory(): IDictionary<RoomData_Memory> {
        return Memory.___Empty___Data;
    }
}
