declare var Memory: {
    spawnData: SpawnerExtension_Memory,
}

import { BasicProcess, ExtensionBase } from "Core/BasicTypes";

export const OSPackage: IPackage<SpawnerExtension_Memory> = {
    install(processRegistry: IProcessRegistry, extensionRegistry: IExtensionRegistry) {
        processRegistry.register(PKG_CreepRunner, CreepRunner);
        let CreepRunnerExtension = new SpawnExtension(extensionRegistry);
        extensionRegistry.register(EXT_CreepSpawner, CreepRunnerExtension);
    }
}

const PKG_CreepRunner_LogContext: LogContext = {
    logID: PKG_CreepRunner,
    logLevel: LOG_INFO
}

class CreepRunner extends BasicProcess<{}> {
    @extensionInterface(EXT_CreepSpawner)
    SpawnerExtensions!: SpawnExtension;

    protected get spawnerMemory(): SpawnerExtension_Memory {
        if (!Memory.spawnData) {
            this.log.warn(`Initializing CreepRunner spawnerMemory`);
            Memory.spawnData = {
                queue: {},
                spawnedCreeps: {}
            }
        }
        return Memory.spawnData;
    }
    protected get spawnQueue(): SDictionary<SpawnerRequest> {
        return this.spawnerMemory.queue;
    }
    protected get spawnedCreeps(): SDictionary<CreepContext> {
        return this.spawnerMemory.spawnedCreeps;
    }
    protected get spawnCosts(): SDictionary<number> {
        return this.cache.costs;
    }

    // (TODO): make contexts and attach to the process context
    protected get logID(): string {
        return PKG_CreepRunner_LogContext.logID;
    }
    protected get logLevel(): LogLevel {
        return PKG_CreepRunner_LogContext.logLevel!;
    }

    executeProcess(): void {
        let unassignedCreeps: SDictionary<Creep> = {};

        // This confines the CreepRunner to only manage creeps that
        // have been spawned by it.
        let spawnedIDs = Object.keys(this.spawnedCreeps);
        for (let i = 0; i < spawnedIDs.length; i++) {
            let creepName = spawnedIDs[i];
            let creep = Game.creeps[creepName];
            if (!creep) {
                delete this.spawnedCreeps[creepName];
            }
            if (!this.kernel.getProcessById(this.spawnCreeps[creepName])) {
                unassignedCreeps[creepName] = creep
            }
        }
        this.spawnCreeps(unassignedCreeps);
    }

    protected spawnCreeps(unassignedCreeps: SDictionary<Creep>): void {
        let requests = Object.keys(this.spawnQueue);
        if (requests.length == 0) {
            this.log.warn(`No spawn requests in the queue.  You have spawn capacity available.`);
            return;
        }

        let minSpawnCost = 20000;
        for (let i = 0; i < requests.length; i++) {
            // (TODO): This needs to convert the body parts to a string that can be easily hashed: 8m6c2w -- etc...
            if (!this.spawnCosts[requests[i]]) {
                this.spawnCosts[requests[i]] = 0; // Calculate the cost of the spawn and cache it.
            }
            let spawnCost = this.spawnCosts[requests[i]]; // (TODO): Will this slow down the running script if it never gets cleaned and the OS doesn't reload?
            let creepIDs = Object.keys(unassignedCreeps);
            let compatibleCreep = undefined;
            for (let j = 0; j < creepIDs.length; j++) {
                // Check if bodies are compatible, if so, don't bother spawning it, just assign the damn pid
                if (!this.isInDebugMode) {
                    compatibleCreep = Game.creeps[creepIDs[j]];
                }
            }

            if (compatibleCreep) {
                // Assign the creep
                continue;
            }
            minSpawnCost = Math.min(minSpawnCost, spawnCost);
        }
        let availableSpawns: SDictionary<StructureSpawn> = {};

        let allSpawnIDs = Object.keys(Game.spawns);
        for (let i = 0, length = allSpawnIDs.length; i < length; i++) {
            let spawn = Game.spawns[allSpawnIDs[i]];
            if (spawn.isActive() && !spawn.spawning && spawn.room.energyAvailable >= minSpawnCost) {
                availableSpawns[allSpawnIDs[i]] = spawn;
            }
        }

        let sortedSpawns = Object.keys(availableSpawns).sort((a, b) => {
            return availableSpawns[a].room.energyAvailable > availableSpawns[b].room.energyAvailable ? -1 : 1;
        });

        this.log.debug(`AvailableSpawnerCount(${sortedSpawns.length}) - SpawnRequestCount(${requests.length})`);
        for (let i = 0; i < sortedSpawns.length; i++) {
            let spawnRequest: { req?: SpawnerRequest, diff: number } = { req: undefined, diff: 0 };
            let spawn = availableSpawns[sortedSpawns[i]];

            for (let j = 0; j < requests.length; j++) {
                let req = this.spawnQueue[requests[j]];
                let diff = this.spawnCosts[req.name];
                let dist = Game.map.getRoomLinearDistance(spawn.room.name, req.loc);
                if (req.max && dist > req.max) {
                    continue;
                }
                diff += E2C_MaxSpawnDistance * (req.max || 0);
                diff -= E2C_SpawnDistance * dist;
                if (spawnRequest.req && req.pri != spawnRequest.req.pri) {
                    if (req.pri > spawnRequest.req.pri) {
                        spawnRequest = { req, diff }
                    }
                    continue;
                }

                if (!spawnRequest.req || diff > spawnRequest.diff) {
                    spawnRequest = { req, diff }
                }
            }

            if (spawnRequest.req && spawnRequest.diff > 0) {
                // Spawn it
                let spawnResult = ERR_INVALID_ARGS as ScreepsReturnCode;
                while (spawnResult != OK && spawnRequest.req.sta == SP_QUEUED) {
                    // construct the body here somehow
                    spawnResult = spawn.spawnCreep([WORK, CARRY, MOVE], //spawnRequest.req.body.body,
                        spawnRequest.req.name,
                        { memory: spawnRequest.req.dm });
                    switch (spawnResult) {
                        case (ERR_NAME_EXISTS):
                            spawnRequest.req.name += `_` + (Game.time % GetRandomIndex(primes_100));
                        case (OK):
                            break;
                        default:
                            this.log.error(`Spawn Creep has failed (${spawnResult})`);
                            spawnRequest.req.sta = SP_ERROR;
                            break;
                    }
                }

                if (spawnResult == OK) {
                    this.log.debug(`Spawn Creep successful for ${spawnRequest.req.name} - pid(${spawnRequest.req.pid})`);
                    spawnRequest.req.sta = SP_SPAWNING;
                    this.spawnedCreeps[spawnRequest.req.name] = {
                        o: spawnRequest.req.pid,
                        c: 0,
                        m: 0,
                        w: 0,
                        n: spawnRequest.req.name
                    }
                }
            }
        }
    }
}

class SpawnExtension extends ExtensionBase implements ISpawnExtension {
    protected get memory(): SpawnerExtension_Memory {
        if (!Memory.spawnData) {
            this.log.warn(`Initializing CreepRunner memory`);
            Memory.spawnData = {
                queue: {},
                spawnedCreeps: {}
            }
        }
        return Memory.spawnData;
    }
    protected get spawnQueue(): SDictionary<SpawnerRequest> {
        return this.memory.queue;
    }
    protected get spawnedCreeps(): SDictionary<CreepContext> {
        return this.memory.spawnedCreeps;
    }

    cancelRequest(id: string): boolean {
        if (this.spawnQueue[id]) {
            delete this.spawnQueue[id];
            return true;
        }

        return false;
    }
    getCreep(id: string): Creep | undefined {
        if (Game.creeps[id]) {
            return Game.creeps[id];
        }

        return;
    }
    getRequestStatus(id: string): SpawnState {
        if (!this.spawnQueue[id]) {
            return SP_ERROR;
        }
        let spawnCard = this.spawnQueue[id];
        let spawnState = spawnCard.sta;

        if (spawnState == SP_SPAWNING) {
            let creep = Game.creeps[spawnCard.name];
            if (creep && !creep.spawning) {
                this.spawnQueue[id].sta = SP_COMPLETE;
                spawnState = SP_COMPLETE;
            }
        }

        return spawnState;
    }

    requestCreep(opts: SpawnerRequest): CreepContext {
        if (Game.creeps[opts.name]) {
            if (this.spawnQueue[opts.name]) {
                return this.spawnQueue[opts.name].con;
            }/* else {
                do something?  These could be already assigned, and rejected as requests,
                or it could be used to override process ownership of a creep
            }*/
        }
        this.spawnQueue[opts.name] = opts;
        return opts.con;
    }
}