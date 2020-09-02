declare var Memory: {
  spawnData: SpawnManager_Memory;
}

import { BasicProcess, ExtensionBase } from "Core/BasicTypes";

export const OSPackage: IPackage = {
  install(processRegistry: IProcessRegistry,
    extensionRegistry: IExtensionRegistry) {
    processRegistry.register(PKG_SpawnManager, SpawnManager);
    extensionRegistry.register(EXT_SpawnManager,
      new SpawnManagerExtensions(extensionRegistry));
  }
}

const ConvertBodyToCost = function (body: BodyPartConstant[]) {
  let cost = 0;
  for (let i = 0; i < body.length; i++) {
    cost += BODYPART_COST[body[i]];
  }

  return cost;
}

const PKG_SpawnManager_LogContext: LogContext = {
  logID: PKG_SpawnManager,
  logLevel: LOG_INFO
}

class SpawnManager extends BasicProcess<SpawnManager_Memory> {
  get memory() {
    if (!Memory.spawnData) {
      this.log.warn(`Initializing SpawnManager memory`);
      Memory.spawnData = {};
    }

    return Memory.spawnData;
  }
  protected get logID(): string {
    return PKG_SpawnManager_LogContext.logID;
  }
  protected get logLevel(): LogLevel {
    return PKG_SpawnManager_LogContext.logLevel;
  }

  RunThread(): ThreadState {
    this.log.debug(`Begin SpawnManager`);
    let requests = Object.keys(this.memory);
    if (requests.length == 0) {
      this.log.debug(`No spawn requests in the queue.  You have spawn capacity available.`);
      return ThreadState_Done;
    }

    let spawnIDs = Object.keys(Game.spawns);
    let activeSpawns = {};
    for (let i = 0, length = spawnIDs.length; i < length; i++) {
      let spawn = Game.spawns[spawnIDs[i]];
      if (spawn.isActive() && !spawn.spawning) {
        activeSpawns[spawnIDs[i]] = spawn;
      }
    }
    if (Object.keys(activeSpawns).length == 0) {
      // No spawn capacity
      return ThreadState_Done;
    }
    let sortedSpawnIDs = Object.keys(activeSpawns).sort((a, b) => {
      return activeSpawns[a].room.energyAvailable >
        activeSpawns[b].room.energyAvailable ? -1 : 1;
    });

    let usedRequestIDs: string[] = [];
    let activeRequests = this.analyzeSpawnRequests();
    let requestIDs = Object.keys(activeRequests);
    for (let i = 0, iLength = sortedSpawnIDs.length; i < iLength; i++) {
      let spawn: StructureSpawn = activeSpawns[sortedSpawnIDs[i]];
      let spawnRequest: { request?: SpawnRequest, bodyCost: number } =
        { request: undefined, bodyCost: 0 };
      let minPriority: Priority = Priority_Hold;

      for (let j = 0, jLength = requestIDs.length; j < jLength; j++) {
        let request = this.memory[requestIDs[j]];
        if (usedRequestIDs.includes(request.spawnID)) {
          continue;
        }
        let body = request.spawnContext.body;
        let bodyCost = ConvertBodyToCost(body);
        if (spawn.room.energyCapacityAvailable < bodyCost) {
          continue;
        }
        if (request.spawnPriority < minPriority) {
          continue;
        }

        minPriority = request.spawnPriority;
        if (bodyCost > spawn.room.energyAvailable) {
          continue;
        }

        if (!spawnRequest.request || bodyCost > spawnRequest.bodyCost ||
          request.spawnPriority > spawnRequest.request.spawnPriority) {
          spawnRequest = { request: request, bodyCost: bodyCost };
        }
      }

      if (spawnRequest.request && spawnRequest.bodyCost > 0 &&
        spawnRequest.request.spawnPriority == minPriority) {
        if (this.spawnCreep(spawn, spawnRequest.request)) {
          usedRequestIDs.push(spawnRequest.request.spawnID);
        }
      }
    }

    this.sleeper.sleep(this.pid, 3);
    this.log.debug(`End SpawnManager`);
    return ThreadState_Done;
  }

  protected analyzeSpawnRequests(): SDictionary<SpawnRequest> {
    let activeRequests = {};

    let requests = Object.keys(this.memory);
    for (let i = 0; i < requests.length; i++) {
      let request = this.memory[requests[i]];
      if (request.spawnState != SP_QUEUED) {
        if (request.spawnState == SP_SPAWNING) {
          if (!Game.creeps[request.spawnContext.creepName]) {
            request.spawnState = SP_ERROR;
          } else if (!Game.creeps[request.spawnContext.creepName].spawning) {
            request.spawnState = SP_COMPLETE;
          }
        }
        continue;
      }
      activeRequests[requests[i]] = request;
    }

    return activeRequests;
  }

  protected spawnCreep(spawn: StructureSpawn, req: SpawnRequest): boolean {
    let spawnResult = ERR_INVALID_ARGS as ScreepsReturnCode;
    let spawnMem: CreepMemory = Object.assign(req.defaultMemory || {}, {
      parentPID: req.spawnContext.owner_pid
    });

    while (spawnResult != OK && req.spawnState == SP_QUEUED) {
      spawnResult = spawn.spawnCreep(
        req.spawnContext.body,
        req.spawnContext.creepName,
        { memory: spawnMem });
      switch (spawnResult) {
        case (ERR_NOT_ENOUGH_ENERGY):
          return false;
        case (ERR_NAME_EXISTS):
          req.spawnContext.creepName += `_` +
            (Game.time % GetRandomIndex(primes_100));
        case (OK):
          break;
        default:
          this.log.error(`Spawn Creep has failed (${spawnResult})`);
          req.spawnState = SP_ERROR;
          break;
      }
    }

    if (spawnResult == OK) {
      this.log.debug(`Spawn Creep successful for ${req.spawnID})`);
      req.spawnState = SP_SPAWNING;
      return true;
    }
    return false;
  }
}

class SpawnManagerExtensions extends ExtensionBase implements ISpawnManagerExtensions {
  get memory(): SpawnManager_Memory {
    if (!Memory.spawnData) {
      this.log.warn(`Initializing SpawnManager memory`);
      Memory.spawnData = {}
    }
    return Memory.spawnData;
  }
  protected get logID(): string {
    return PKG_SpawnManager_LogContext.logID;
  }
  protected get logLevel(): LogLevel {
    return PKG_SpawnManager_LogContext.logLevel;
  }

  cancelRequest(id: SpawnRequestID): boolean {
    if (this.memory[id]) {
      delete this.memory[id];
      return true;
    }

    return false;
  }

  getRequestContext(id: SpawnRequestID): SpawnContext | undefined {
    if (id && this.memory[id]) {
      return this.memory[id].spawnContext;
    }

    return undefined;
  }

  getRequestStatus(id: SpawnRequestID): SpawnState {
    if (!this.memory[id]) {
      return SP_ERROR;
    }
    let spawnRequest = this.memory[id];

    if (spawnRequest.spawnState == SP_SPAWNING) {
      let creep = Game.creeps[spawnRequest.spawnContext.creepName];
      if (creep && !creep.spawning) {
        this.memory[id].spawnState = SP_COMPLETE;
        spawnRequest.spawnState = SP_COMPLETE;
      }
    }

    return spawnRequest.spawnState;
  }

  requestSpawn(context: SpawnContext, location: RoomID, spawnPriority: Priority,
    startMem: CreepMemory, maxDistance: number = 3): SpawnID {
    let newRequest: SpawnRequest = {
      defaultMemory: startMem,
      maxDist: maxDistance,
      spawnContext: context,
      spawnID: GetSUID(),
      spawnOrigin: location,
      spawnPriority: spawnPriority,
      spawnState: SP_QUEUED,
    }

    this.memory[newRequest.spawnID] = newRequest;
    return newRequest.spawnID;
  }
}