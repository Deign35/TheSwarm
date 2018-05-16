declare var Memory: {
    spawnedCreeps: CreeperExtension_Memory
}

import { BasicProcess, ExtensionBase } from "Core/BasicTypes";

export const OSPackage: IPackage<SpawnRegistryExtension_Memory> = {
    install(processRegistry: IProcessRegistry, extensionRegistry: IExtensionRegistry) {
        processRegistry.register(PKG_CreepRunner, CreepRunner);

        let CreepRunnerExtension = new CreepRegistryExtensions(extensionRegistry);
        extensionRegistry.register(EXT_CreepSpawner, CreepRunnerExtension);
        extensionRegistry.register(EXT_CreepRegistry, CreepRunnerExtension);
    }
}

const PKG_CreepRunner_LogContext: LogContext = {
    logID: PKG_CreepRunner,
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

class CreepRunner extends BasicProcess<{}> {
    @extensionInterface(EXT_CreepRegistry)
    CreepRegistry!: ICreepRegistryExtensions;

    protected get spawnerMemory(): CreeperExtension_Memory {
        if (!Memory.spawnedCreeps) {
            this.log.warn(`Initializing CreepRunner spawnerMemory`);
            Memory.spawnedCreeps = {
                spawnedCreeps: {}
            }
        }
        return Memory.spawnedCreeps;
    }
    protected get spawnedCreeps(): SDictionary<CreepContext> {
        return this.spawnerMemory.spawnedCreeps;
    }

    protected get logID(): string {
        return PKG_CreepRunner_LogContext.logID;
    }
    protected get logLevel(): LogLevel {
        return PKG_CreepRunner_LogContext.logLevel!;
    }

    executeProcess(): void {
        this.log.debug(`Begin CreepRunner`);
        let unassignedCreeps: SDictionary<Creep> = {};

        // (TODO) Revert all managers from using global memory.  Just do it right(?)
        // This confines the CreepRunner to only manage creeps that
        // have been spawned by it.
        let spawnedIDs = Object.keys(this.spawnedCreeps);
        for (let i = 0; i < spawnedIDs.length; i++) {
            let spawnID = spawnedIDs[i] as SpawnRequestID;
            let creepContext = this.spawnedCreeps[spawnID];
            let creepName = creepContext.n;
            let creep = Game.creeps[creepName];
            if (!creep) {
                delete this.spawnedCreeps[spawnID];
                continue;
            }
            // (TODO): Find a way to clear dead spawn requests
            if (!this.spawnedCreeps[spawnID].o || !this.kernel.getProcessById(this.spawnedCreeps[spawnID].o!)) {
                unassignedCreeps[spawnID] = creep
            }
        }

        this.sleeper.sleep(3);

        this.log.debug(`End CreepRunner`);
    }
}

class CreepRegistryExtensions extends ExtensionBase implements ICreepRegistryExtensions {
    protected get memory(): CreeperExtension_Memory {
        if (!Memory.spawnedCreeps) {
            this.log.warn(`Initializing CreepRunner memory`);
            Memory.spawnedCreeps = {
                spawnedCreeps: {}
            }
        }
        return Memory.spawnedCreeps;
    }
    protected get spawnedCreeps(): SDictionary<CreepContext> {
        return this.memory.spawnedCreeps;
    }

    // Creeper extensions
    getCreep(id: SpawnRequestID, requestingPID: PID): CreepContext | undefined {
        let request = this.spawnedCreeps[id];
        if (!request || !Game.creeps[request.n] || !request.o || request.o != requestingPID) {
            return undefined;
        }
        return request;
    }

    releaseCreep(id: SpawnRequestID): void {
        // (TODO): Move these to a CreepGroup that manages temporary workers
        if (this.spawnedCreeps[id]) {
            this.spawnedCreeps[id].o = undefined;
        }
    }

    requestCreep(id: SpawnRequestID, requestingPID: PID): boolean {
        if (!this.spawnedCreeps[id].o) {
            // (TODO): Add a priority here to ensure higher priority tasks take precedence.
            this.spawnedCreeps[id].o = requestingPID;
        }
        return false;
    }
}