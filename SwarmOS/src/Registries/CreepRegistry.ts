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
            Memory.creepData = {
                registeredCreeps: {}
            }
        }
        return Memory.creepData;
    }
    protected get registeredCreeps() {
        return this.memory.registeredCreeps;
    }

    protected get logID(): string {
        return PKG_CreepRegistry_LogContext.logID;
    }
    protected get logLevel(): LogLevel {
        return PKG_CreepRegistry_LogContext.logLevel!;
    }

    PrepTick() {
        let creepIDs = Object.keys(this.memory.registeredCreeps);
        for (let i = 0; i < creepIDs.length; i++) {
            if (!this.kernel.getProcessByPID(this.memory.registeredCreeps[creepIDs[i]].o!)) {
                delete this.memory.registeredCreeps[creepIDs[i]].o;
            }
            if (!Game.creeps[creepIDs[i]]) {
                delete this.memory.registeredCreeps[creepIDs[i]];
            }
        }
        creepIDs = Object.keys(Game.creeps);
        for (let i = 0, length = creepIDs.length; i < length; i++) {
            let creep = Game.creeps[creepIDs[i]];
            if (!creep) {
                delete this.registeredCreeps[creepIDs[i]];
                continue;
            }
            let context = this.registeredCreeps[creepIDs[i]];
            if (!context) {
                this.Extensions.tryRegisterCreep({
                    ct: creep.memory.ct,
                    l: creep.memory.lvl,
                    n: creep.name
                })
            }
        }
    }

    RunThread(): ThreadState {
        return ThreadState_Done;
    }
}
class CreepRegistryExtensions extends ExtensionBase implements ICreepRegistryExtensions {
    protected get memory(): CreepRegistry_Memory {
        if (!Memory.creepData) {
            this.log.warn(`Initializing CreepRegistry memory`);
            Memory.creepData = {
                registeredCreeps: {}
            }
        }
        return Memory.creepData;
    }
    protected get registeredCreeps() {
        return this.memory.registeredCreeps;
    }

    tryFindCompatibleCreep(creepType: CT_ALL, level: number, targetRoom: RoomID, maxDistance: number = 3): string | undefined {
        let bestMatch: CreepContext | undefined = undefined;
        let dist = maxDistance + 1;
        let desiredBody = CreepBodies[creepType][level];
        let creepIDs = Object.keys(this.registeredCreeps);
        for (let i = 0; i < creepIDs.length; i++) {
            let creep = this.registeredCreeps[creepIDs[i]];
            if (creep.o) { continue; }

            let compareDist = Game.map.getRoomLinearDistance(Game.creeps[creep.n].room.name, targetRoom);
            let betterMatch = false;

            if (creep.ct == creepType) {
                if (!bestMatch) {
                    betterMatch = true;
                } else {
                    if (bestMatch.l != level || bestMatch.l == creep.l) {
                        if (compareDist < dist) {
                            betterMatch = true;
                        }
                    } else {
                        if (bestMatch.l < level && creep.l > bestMatch.l) {
                            betterMatch = true;
                        } else if (bestMatch.l > level && creep.l < bestMatch.l) {
                            betterMatch = true;
                        }
                    }
                }
            }

            if (betterMatch) {
                bestMatch = creep;
                dist = compareDist;
            }
        }

        return bestMatch ? bestMatch.n : undefined;
    }

    tryRegisterCreep(creepContext: CreepContext): boolean {
        if (!this.registeredCreeps[creepContext.n]) {
            this.registeredCreeps[creepContext.n] = creepContext;
            return true;
        }

        return false;
    }

    tryGetCreep(id?: CreepID, requestingPID?: PID): Creep | undefined {
        if (!id || !requestingPID) {
            return undefined;;
        }
        let request = this.registeredCreeps[id];
        if (!request || !Game.creeps[request.n] || !request.o || request.o != requestingPID) {
            return undefined;
        }
        return Game.creeps[request.n];
    }

    tryReserveCreep(id?: CreepID, requestingPID?: PID): boolean {
        if (!id || !requestingPID) {
            return false;
        }
        if (!this.registeredCreeps[id].o) {
            this.registeredCreeps[id].o = requestingPID;
        }
        return this.registeredCreeps[id].o == requestingPID;
    }

    releaseCreep(id?: CreepID, requestingPID?: PID): void {
        if (!id || !requestingPID) {
            return;
        }
        if (this.registeredCreeps[id]) {
            if (!requestingPID || this.registeredCreeps[id].o == requestingPID) {
                this.registeredCreeps[id].o = undefined;
            }
        }
    }
}