import { BasicProcess, ExtensionBase } from "Core/BasicTypes";

export const OSPackage: IPackage<CreepRegistry_Memory> = {
    install(processRegistry: IProcessRegistry, extensionRegistry: IExtensionRegistry) {
        processRegistry.register(PKG_CreepRegistry, CreepRegistry);
    }
}

const PKG_CreepRegistry_LogContext: LogContext = {
    logID: PKG_CreepRegistry,
    logLevel: LOG_DEBUG
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

    protected OnProcessInstantiation() {
        this.extensions.register(EXT_CreepRegistry, new CreepRegistryExtensions(this.extensions, this.memory));
    }

    protected get logID(): string {
        return PKG_CreepRegistry_LogContext.logID;
    }
    protected get logLevel(): LogLevel {
        return PKG_CreepRegistry_LogContext.logLevel!;
    }

    executeProcess(): void {
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

            if (!context.o || !this.kernel.getProcessByPID(context.o)) {
                // This creep is an orphan, find a job for it
            }
        }

        this.log.debug(`End CreepRunner`);
    }
}
class CreepRegistryExtensions extends ExtensionBase implements ICreepRegistryExtensions {
    constructor(extRegistry: IExtensionRegistry, private _memory: CreepRegistry_Memory) { super(extRegistry); }
    protected get memory(): CreepRegistry_Memory {
        return this._memory
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
        return false;
    }

    releaseCreep(id: CreepID): void {
        if (this.memory[id]) {
            this.memory[id].o = undefined;
        }
    }
}