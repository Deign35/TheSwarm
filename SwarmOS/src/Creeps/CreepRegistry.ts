import { BasicProcess, ExtensionBase } from "Core/BasicTypes";

export const OSPackage: IPackage<SpawnRegistry_Memory> = {
    install(processRegistry: IProcessRegistry, extensionRegistry: IExtensionRegistry) {
        processRegistry.register(PKG_CreepRegistry, CreepRunner);
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
//                                                                                       LTOE = Less than or equal (e.g. the creep is bigger than required)
const CompareContextCompatibility = function (context: CreepContext, creep: Creep, strictLTOE: boolean = false) {
    let score = 0;

    let desiredCreepDef = CreepBodies.get(context.b)[context.l];
    for (let bodyID in BodyLegend) {
        let desiredCount = desiredCreepDef[bodyID] || 0;
        let hasCount = creep.getActiveBodyparts(BodyLegend[bodyID]) || 0;
        if (desiredCount > 0 || hasCount > 0) {
            if (desiredCount == 0 || hasCount == 0 || (strictLTOE && desiredCount > hasCount)) {
                return 0;
            }
        }

        score += BODYPART_COST[BodyLegend[bodyID]] * Math.abs(desiredCount - hasCount);
    }

    return score;
}

class CreepRunner extends BasicProcess<CreepRegistry_Memory> {
    @extensionInterface(EXT_CreepRegistry)
    Extensions!: ICreepRegistryExtensions;

    protected OnOSLoad() {
        this.Extensions = new CreepRegistryExtensions(this.extensions, this.memory);
        this.extensions.register(EXT_CreepRegistry, this.Extensions);
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
            if (!Game.creeps[creepIDs[i]]) {
                delete this.memory[creepIDs[i]];
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