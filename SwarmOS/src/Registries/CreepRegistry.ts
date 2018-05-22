declare var Memory: {
    creepData: CreepRegistry_Memory;
}

import { BasicProcess, ExtensionBase } from "Core/BasicTypes";

export const OSPackage: IPackage<CreepRegistry_Memory> = {
    install(processRegistry: IProcessRegistry, extensionRegistry: IExtensionRegistry) {
        processRegistry.register(PKG_CreepRegistry, CreepRegistry);
        extensionRegistry.register(EXT_CreepRegistry, new CreepRegistryExtensions(extensionRegistry));
    }
}

const PKG_CreepRegistry_LogContext: LogContext = {
    logID: PKG_CreepRegistry,
    logLevel: LOG_INFO
}

// This order determines the default order of body parts
const BodyLegend = {
    t: TOUGH,
    a: ATTACK,
    r: RANGED_ATTACK,
    cl: CLAIM,
    w: WORK,
    c: CARRY,
    h: HEAL,
    m: MOVE,
}

// This can eventually become a CreepGroup, but one that controls all the creeps -- Scheduler!!!!
class CreepRegistry extends BasicProcess<CreepRegistry_Memory> {
    @extensionInterface(EXT_CreepRegistry)
    Extensions!: ICreepRegistryExtensions;
    protected get memory(): CreepRegistry_Memory {
        if (!Memory.creepData) {
            this.log.warn(`Initializing CreepRegistry memory`);
            Memory.creepData = {}
        }
        return Memory.creepData;
    }

    protected get logID(): string {
        return PKG_CreepRegistry_LogContext.logID;
    }
    protected get logLevel(): LogLevel {
        return PKG_CreepRegistry_LogContext.logLevel!;
    }

    RunThread(): ThreadState {
        this.log.debug(`Begin CreepRunner`);

        let creepIDs = Object.keys(this.memory);
        for (let i = 0, length = creepIDs.length; i < length; i++) {
            let creep = Game.creeps[creepIDs[i]];
            if (!creep) {
                delete this.memory[creepIDs[i]];
                continue;
            }
            let context = this.memory[creepIDs[i]];
            if (!context) {
                continue;
            }

            if (context.o && !this.kernel.getProcessByPID(context.o)) {
                // This creep is an orphan, find a job for it
                context.o = undefined;
            }
        }

        this.log.debug(`End CreepRunner`);
        return ThreadState_Done;
    }
}
class CreepRegistryExtensions extends ExtensionBase implements ICreepRegistryExtensions {
    protected get memory(): CreepRegistry_Memory {
        if (!Memory.creepData) {
            this.log.warn(`Initializing CreepRegistry memory`);
            Memory.creepData = {}
        }
        return Memory.creepData;
    }

    tryFindCompatibleCreep(creepType: CT_ALL, level: number, targetRoom: RoomID, maxDistance: number = 3): string | undefined {
        //Cycle through temp workers and provide it

        return undefined;
    }

    tryRegisterCreep(creepContext: CreepContext): boolean {
        if (!this.memory[creepContext.n]) {
            this.memory[creepContext.n] = creepContext;
            return true;
        }

        return false;
    }

    tryGetCreep(id: CreepID, requestingPID: PID): Creep | undefined {
        let request = this.memory[id];
        if (!request || !Game.creeps[request.n] || !request.o || request.o != requestingPID) {
            return undefined;
        }
        return Game.creeps[request.n];
    }

    tryReserveCreep(id: CreepID, requestingPID: PID): boolean {
        if (!this.memory[id].o) {
            this.memory[id].o = requestingPID;
            return true;
        }
        return this.memory[id].o == requestingPID;
    }

    releaseCreep(id: CreepID): void {
        if (this.memory[id]) {
            this.memory[id].o = undefined;
        }
    }
}