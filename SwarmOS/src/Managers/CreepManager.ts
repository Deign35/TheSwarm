declare var Memory: {
  creepData: CreepManager_Memory;
  creeps: SDictionary<CreepMemory>;
}

declare type CreepMoveCache = {
  path?: PathStep[];
  range: number;
  targetPos: RoomPosition;
  tick: number;
  lastPos: RoomPosition;
  gotStuck: number
}
declare var MemoryCache: {
  creepManager: IDictionary<CreepID, CreepMoveCache>;
}

import { BasicProcess, ExtensionBase } from "Core/BasicTypes";

export const OSPackage: IPackage = {
  install(processRegistry: IProcessRegistry, extensionRegistry: IExtensionRegistry) {
    processRegistry.register(PKG_CreepManager, CreepManager);
    extensionRegistry.register(EXT_CreepManager, new CreepManagerExtensions(extensionRegistry));
  }
}

const PKG_CreepManager_LogContext: LogContext = {
  logID: PKG_CreepManager,
  logLevel: LOG_INFO
}

class CreepManager extends BasicProcess<CreepManager_Memory, MemCache> {
  @extensionInterface(EXT_CreepManager)
  creepExtensions!: ICreepManagerExtensions;

  get memory(): CreepManager_Memory {
    if (!Memory.creepData) {
      this.log.warn(`Initializing CreepManager memory`);
      Memory.creepData = {
        registeredCreeps: {}
      }
    }

    return Memory.creepData;
  }
  get cache(): IDictionary<CreepID, CreepMoveCache> {
    if (!MemoryCache.creepManager) {
      MemoryCache.creepManager = {};
    }
    return MemoryCache.creepManager;
  }
  protected get logID(): string {
    return PKG_CreepManager_LogContext.logID;
  }
  protected get logLevel(): LogLevel {
    return PKG_CreepManager_LogContext.logLevel;
  }
  protected get registeredCreeps() {
    return this.memory.registeredCreeps;
  }

  PrepTick() {
    const creepIDs = Object.keys(this.registeredCreeps);
    for (let i = 0, length = creepIDs.length; i < length; i++) {
      if (!this.kernel.getProcessByPID(this.registeredCreeps[creepIDs[i]].ownerPID!)) {
        delete this.memory.registeredCreeps[creepIDs[i]].ownerPID;
      }

      if (!Game.creeps[creepIDs[i]]) {
        delete this.memory.registeredCreeps[creepIDs[i]];
        delete Memory.creeps[creepIDs[i]];
      }
    }
  }

  RunThread(): ThreadState {
    if (Game.time % 23 == 0) {
      const creepIDs = Object.keys(Game.creeps);
      for (let i = 0, length = creepIDs.length; i < length; i++) {
        const creep = Game.creeps[creepIDs[i]];
        const context = this.registeredCreeps[creep.name];
        if (!context) {
          if (!this.creepExtensions.tryRegisterCreep(creep.name)) {
            this.log.error(`Creep context doesnt exist and couldnt register the creep(${creep.name}).`);
            continue;
          }
        }
      }
    }

    return ThreadState_Done;
  }

  EndTick() {
    for (const creepID in Game.creeps) {
      if (!this.cache[creepID]) { continue; }
      const creep = Game.creeps[creepID];
      const moveData = this.cache[creepID];
      if (moveData.tick != Game.time) { continue; }
      const newPath = !moveData.path;
      if (!moveData.path) {
        moveData.path = creep.pos.findPathTo(moveData.targetPos, {
          ignoreCreeps: moveData.gotStuck < 3,
          ignoreDestructibleStructures: false,
          ignoreRoads: false,
          range: moveData.range,
        });
      }

      let checkPos = creep.pos;
      if (newPath && moveData.path.length > 0) {
        checkPos = new RoomPosition(moveData.path[0].x, moveData.path[0].y, creep.room.name);
      } else {
        // Find the position that the creep is at and check the next pos.
        for (let i = 0; i < moveData.path.length; i++) {
          const nextPos = new RoomPosition(moveData.path[i].x, moveData.path[i].y, creep.room.name);
          if (nextPos.isEqualTo(creep.pos) && moveData.path.length - 1 > i) {
            checkPos = new RoomPosition(moveData.path[i + 1].x, moveData.path[i + 1].y, creep.room.name);
          }
        }
      }

      const blockingCreep = checkPos.lookFor(LOOK_CREEPS);
      if (blockingCreep.length > 0) {
        const otherCreep = blockingCreep[0];
        if (otherCreep.name != creep.name && otherCreep.my && !(this.cache[otherCreep.name] && this.cache[otherCreep.name].tick == Game.time)) {
          // Move the blocking creep.
          const checkedLocations = new Array(8).fill(false);
          let checked = 0;
          let foundNewPosition = false;
          while (!foundNewPosition) {
            const toCheck: DirectionConstant = Math.floor(Math.random() * 8) + 1 as DirectionConstant;
            if (checkedLocations[toCheck - 1]) {
              if (checked == 8) { break; }
              continue;
            }
            checkedLocations[toCheck - 1] = true;
            checked++;
            let dx = 0, dy = 0;
            switch (toCheck) {
              case (TOP):
                dx = 0;
                dy = -1;
                break;
              case (TOP_RIGHT):
                dx = 1;
                dy = -1;
                break;
              case (RIGHT):
                dx = 1;
                dy = 0;
                break;
              case (BOTTOM_RIGHT):
                dx = 1;
                dy = 1;
                break;
              case (BOTTOM):
                dx = 0;
                dy = 1;
                break;
              case (BOTTOM_LEFT):
                dx = -1;
                dy = 1;
                break;
              case (LEFT):
                dx = -1;
                dy = 0;
                break;
              case (TOP_LEFT):
                dx = -1;
                dy = -1;
                break;
            }

            const nextPos = new RoomPosition(otherCreep.pos.x + dx, otherCreep.pos.y + dy, otherCreep.room.name);
            let obstacleFound = false;
            const nearbyTerrain = nextPos.lookFor(LOOK_TERRAIN);
            if (nearbyTerrain.length > 0) {
              if (nearbyTerrain[0] == "wall") {
                obstacleFound = true;
              }
            }
            if (obstacleFound) { continue; }

            const nearbyCreep = nextPos.lookFor(LOOK_CREEPS);
            if (nearbyCreep.length > 0) {
              if (nearbyCreep[0].name == creep.name) {
                // Go ahead and swap locations.
                foundNewPosition = true;
                otherCreep.move(toCheck);
              } else {
                obstacleFound = true;
              }
            }
            if (obstacleFound) { continue; }

            const nearbyStructures = nextPos.lookFor(LOOK_STRUCTURES);
            for (let i = 0; i < nearbyStructures.length; i++) {
              if ((OBSTACLE_OBJECT_TYPES as string[]).includes(nearbyStructures[i].structureType)) {
                obstacleFound = true;
                break;
              }
            }
            if (obstacleFound) { continue; }

            const nearbySites = nextPos.lookFor(LOOK_CONSTRUCTION_SITES);
            if (nearbySites.length > 0) {
              if ((OBSTACLE_OBJECT_TYPES as string[]).includes(nearbySites[0].structureType)) {
                obstacleFound = true;
              }
            }
            if (obstacleFound) { continue; }

            const nearbyPowerCreeps = nextPos.lookFor(LOOK_POWER_CREEPS);
            if (nearbyPowerCreeps.length > 0) {
              obstacleFound = true;
            }
            if (obstacleFound) { continue; }

            otherCreep.move(toCheck);
            foundNewPosition = true;
          }
        }
      }
      creep.moveByPath(moveData.path!);
    }
  }
}

class CreepManagerExtensions extends ExtensionBase implements ICreepManagerExtensions {
  get memory(): CreepManager_Memory {
    if (!Memory.creepData) {
      this.log.warn(`Initializing CreepManager memory`);
      Memory.creepData = {
        registeredCreeps: {}
      }
    }

    return Memory.creepData;
  }
  get cache(): IDictionary<CreepID, CreepMoveCache> {
    if (!MemoryCache.creepManager) {
      MemoryCache.creepManager = {};
    }
    return MemoryCache.creepManager;
  }
  protected get logID(): string {
    return PKG_CreepManager_LogContext.logID;
  }
  protected get logLevel(): LogLevel {
    return PKG_CreepManager_LogContext.logLevel;
  }
  protected get registeredCreeps() {
    return this.memory.registeredCreeps;
  }

  tryRegisterCreep(creepID: CreepID): boolean {
    if (!this.registeredCreeps[creepID] && Game.creeps[creepID]) {
      this.registeredCreeps[creepID] = {}
      return true;
    }

    return false;
  }

  tryGetCreep(id: CreepID, requestingPID: PID): Creep | undefined {
    const creepData = this.registeredCreeps[id];
    if (!creepData || !Game.creeps[id] || !creepData.ownerPID || creepData.ownerPID != requestingPID) {
      return undefined;
    }

    return Game.creeps[id];
  }

  tryReserveCreep(id: CreepID, requestingPID: PID): boolean {
    if (!this.registeredCreeps[id]) {
      if (!this.tryRegisterCreep(id)) {
        return false;
      }
    }

    if (!this.registeredCreeps[id].ownerPID) {
      this.registeredCreeps[id].ownerPID = requestingPID;
    }

    return this.registeredCreeps[id].ownerPID == requestingPID;
  }

  releaseCreep(id: CreepID, requestingPID: PID): void {
    if (this.registeredCreeps[id] && this.registeredCreeps[id].ownerPID == requestingPID) {
      this.registeredCreeps[id].ownerPID = undefined;
    }
  }

  MoveCreep(creep: Creep, pos: RoomPosition, range?: number) {
    let resetCache = true;
    let gotStuck = 0;
    if (this.cache[creep.name] && pos.isEqualTo(this.cache[creep.name].targetPos)) {
      resetCache = false;
      this.cache[creep.name].tick = Game.time;
      this.cache[creep.name].range = range || 0;
      if (creep.pos.isEqualTo(this.cache[creep.name].lastPos)) {
        this.cache[creep.name].gotStuck++;
        if (this.cache[creep.name].gotStuck >= 3) {
          resetCache = true;
        }
      } else {
        this.cache[creep.name].gotStuck = 0;
      }

      gotStuck = this.cache[creep.name].gotStuck;
    }

    if (resetCache) {
      this.cache[creep.name] = {
        range: range || 0,
        targetPos: pos,
        tick: Game.time,
        lastPos: creep.pos,
        gotStuck: gotStuck
      }
    }

    return OK;
  }

  CreateNewCreepActivity(actionMem: SingleCreepAction_Memory, parentPID: PID): PID | undefined {
    if (!actionMem || !parentPID || !actionMem.creepID || !actionMem.action) {
      return undefined;
    }
    const creep = this.tryGetCreep(actionMem.creepID, parentPID);
    if (!creep) {
      return undefined;
    }
    let target: ObjectTypeWithID | RoomPosition | null | undefined =
      actionMem.targetID ? Game.getObjectById<ObjectTypeWithID>(actionMem.targetID) : undefined;
    if (!target && actionMem.pos) {
      target = new RoomPosition(actionMem.pos.x || 25, actionMem.pos.y || 25, actionMem.pos.roomName);
    }

    if (!target) {
      target = creep.pos;
    }

    if (!target || !this.ValidateActionTarget(actionMem.action, target, actionMem.resourceType)) {
      return undefined;
    }

    const newPID = this.extensionRegistry.getKernel().startProcess(APKG_CreepActivity, actionMem);
    this.extensionRegistry.getKernel().setParent(newPID, parentPID);
    return newPID;
  }

  RunCreepAction(args: SoloCreepActionArgs): ScreepsReturnCode {
    const creep = args.creep;
    const actionType = args.actionType;
    let target = args.target;
    let actionResult: ScreepsReturnCode = ERR_INVALID_ARGS;
    switch (actionType) {
      case (AT_Attack): actionResult = creep.attack(target); break;
      case (AT_AttackController): actionResult = creep.attackController(target); break;
      case (AT_Build): actionResult = creep.build(target); break;
      case (AT_ClaimController): actionResult = creep.claimController(target); break;
      case (AT_Dismantle):
        actionResult = creep.dismantle(target);
        if (actionResult == OK) {
          if (creep.store.getUsedCapacity() == creep.store.getCapacity()) {
            return ERR_FULL;
          }
        }
        break;
      case (AT_GenerateSafeMode): actionResult = creep.generateSafeMode(target); break;
      case (AT_Harvest):
        actionResult = creep.harvest(target);
        if (actionResult == OK) {
          if (creep.store.getUsedCapacity() == creep.store.getCapacity()) {
            return ERR_FULL;
          }
        }
        break;
      case (AT_Heal):
        actionResult = creep.heal(target);
        if (actionResult == OK) {
          if (!this.ValidateActionTarget(AT_Heal, target)) {
            return ERR_FULL;
          }
        }
        break;
      case (AT_Pickup): actionResult = creep.pickup(target); break;
      case (AT_RangedAttack): actionResult = creep.rangedAttack(target); break;
      case (AT_RangedHeal):
        actionResult = creep.rangedHeal(target);
        if (actionResult == OK) {
          if (!this.ValidateActionTarget(AT_RangedHeal, target)) {
            return ERR_FULL;
          }
        }
        break;
      case (AT_Repair):
        if ((target as Structure).hits == (target as Structure).hitsMax) {
          return ERR_INVALID_TARGET;
        }
        actionResult = creep.repair(target);
        break;
      case (AT_ReserveController): actionResult = creep.reserveController(target); break;
      case (AT_Upgrade): actionResult = creep.upgradeController(target); break;
      case (AT_RequestTransfer):
        if (target.transfer) {
          actionResult = target.transfer(creep, args.resourceType || RESOURCE_ENERGY, args.amount || 0);
        }
        break;
      case (AT_SignController): actionResult = creep.signController(target, args.message || ''); break;
      case (AT_Transfer): actionResult = creep.transfer(target, args.resourceType || RESOURCE_ENERGY, args.amount || 0); break;
      case (AT_Withdraw): actionResult = creep.withdraw(target, args.resourceType || RESOURCE_ENERGY, args.amount || 0); break;
      case (AT_Drop): actionResult = creep.drop(args.resourceType || RESOURCE_ENERGY, args.amount || 0); break;
      case (AT_MoveByPath):
        break;
      case (AT_MoveToPosition):
        if ((target as Structure).pos) {
          target = (target as Structure).pos;
        }
        const result = this.MoveCreep(creep, target, args.distance || 0);
        const dist = creep.pos.getRangeTo(target);
        if (dist == 1 && (target as RoomPosition).isEdge()) {
          return OK;
        }
        if (dist <= (args.distance || 0)) {
          if (creep.pos.isNearTo(target)) {
            const creeps = (target as RoomPosition).lookFor(LOOK_CREEPS);
            if (creeps.length > 0 && creeps[0].name != creep.name) {
              return ERR_NO_PATH;
            }
          }
          return result;
        } else {
          return ERR_NOT_IN_RANGE;
        }
      case (AT_RangedMassAttack): actionResult = creep.rangedMassAttack(); break;
      case (AT_Suicide): actionResult = creep.suicide(); break;
      case (AT_RenewCreep): actionResult = (target as StructureSpawn).renewCreep(creep); break;
      case (AT_NoOp): return OK;
    }

    return actionResult;
  }

  CreepIsInRange(actionType: ActionType, pos1: RoomPosition, pos2: RoomPosition) {
    const distance = pos1.getRangeTo(pos2);
    if (actionType == AT_Build || actionType == AT_RangedAttack ||
      actionType == AT_RangedHeal || actionType == AT_Repair ||
      actionType == AT_Upgrade) {
      return distance <= 3;
    } else if (actionType == AT_Drop || actionType == AT_Suicide) {
      return distance == 0;
    } else {
      return distance <= 1;
    }
  }

  ValidateActionTarget(actionType: ActionType, target: any, resourceType?: ResourceConstant) {
    switch (actionType) {
      case (AT_Attack): return !!(target as Creep | Structure).hitsMax;
      case (AT_AttackController): return (target as Structure).structureType == STRUCTURE_CONTROLLER && !(target as StructureController).upgradeBlocked;
      case (AT_Build): return (target as ConstructionSite).structureType && !(target as Structure).hitsMax;
      case (AT_ClaimController): return (target as Structure).structureType == STRUCTURE_CONTROLLER;
      case (AT_Dismantle): return (target as Structure).structureType && !!(target as Structure).hitsMax;
      case (AT_GenerateSafeMode): return (target as Structure).structureType == STRUCTURE_CONTROLLER;
      case (AT_Harvest): return !(target as Structure).structureType && (!!(target as Source).energyCapacity || !!(target as Mineral).mineralType);
      case (AT_Heal): return !!(target as Creep).ticksToLive && ((target as Creep).hits < (target as Creep).hitsMax);
      case (AT_Pickup): return !!(target as Resource).resourceType;
      case (AT_RangedAttack): return !!(target as Creep | Structure).hitsMax
      case (AT_RangedHeal): return !!(target as Creep).ticksToLive && ((target as Creep).hits < (target as Creep).hitsMax);
      case (AT_Repair): return (target as Structure).structureType && !!(target as Structure).hitsMax && (target as Structure).hits < (target as Structure).hitsMax;
      case (AT_RequestTransfer): return !!(target as Creep).ticksToLive;
      case (AT_ReserveController): return (target as Structure).structureType == STRUCTURE_CONTROLLER;
      case (AT_Upgrade): return (target as Structure).structureType == STRUCTURE_CONTROLLER;
      case (AT_SignController): return (target as Structure).structureType == STRUCTURE_CONTROLLER;
      case (AT_Transfer):
        if (!(target as Creep | Structure).hitsMax) {
          return false;
        }

        if ((target as Structure).structureType) {
          if ((target as StructureStorage).store.getFreeCapacity(resourceType)) {
            return true;
          }
        } else {
          if ((target as Creep).store.getUsedCapacity(resourceType)! < (target as Creep).store.getCapacity() * 0.8) {
            return true;
          }
        }
        return false;
      case (AT_Withdraw):
        return ((target as Structure).structureType || (target as Ruin).structure || (target as Tombstone).deathTime)
          && !!(target as StructureContainer).store && (target as StructureContainer).store.getUsedCapacity(resourceType) > 0;
      case (AT_RenewCreep): return ((target as StructureSpawn).structureType && (target as StructureSpawn).structureType == STRUCTURE_SPAWN && !(target as StructureSpawn).spawning);

      case (AT_Drop):
      case (AT_MoveByPath):
      case (AT_MoveToPosition):
      case (AT_RangedMassAttack):
      case (AT_Suicide):
      case (AT_NoOp):
      default:
        if ((target as Creep).pos) {
          target = target.pos;
        }
        return target && !!(target as RoomPosition).isNearTo;
    }
  }

  EvaluateCreep(creep: Creep) {
    let attackPower = 0;
    let healPower = 0;
    let rangedAttackPower = 0;
    let dismantlePower = 0;
    let effectiveHitPoints = creep.body.length * 100;

    for (let i = 0; i < creep.body.length; i++) {
      const bodyPart = creep.body[i];
      switch (bodyPart.type) {
        case (HEAL):
          if (bodyPart.boost) {
            if (bodyPart.boost === RESOURCE_LEMERGIUM_OXIDE) {
              healPower += 2;
            } else if (bodyPart.boost === RESOURCE_LEMERGIUM_ALKALIDE) {
              healPower += 3;
            } else if (bodyPart.boost === RESOURCE_CATALYZED_LEMERGIUM_ALKALIDE) {
              healPower += 4;
            }
          } else {
            healPower += 1;
          }
          break;
        case (ATTACK):
          if (bodyPart.boost) {
            if (bodyPart.boost === RESOURCE_UTRIUM_HYDRIDE) {
              attackPower += 2;
            } else if (bodyPart.boost === RESOURCE_UTRIUM_ACID) {
              attackPower += 3;
            } else if (bodyPart.boost === RESOURCE_CATALYZED_UTRIUM_ACID) {
              attackPower += 4;
            }
          } else {
            attackPower += 1;
          }
          break;
        case (RANGED_ATTACK):
          if (bodyPart.boost) {
            if (bodyPart.boost === RESOURCE_KEANIUM_OXIDE) {
              rangedAttackPower += 2;
            } else if (bodyPart.boost === RESOURCE_KEANIUM_ALKALIDE) {
              rangedAttackPower += 3;
            } else if (bodyPart.boost === RESOURCE_CATALYZED_KEANIUM_ALKALIDE) {
              rangedAttackPower += 4;
            }
          } else {
            rangedAttackPower += 1;
          }
          break;
        case (WORK):
          if (bodyPart.boost) {
            if (bodyPart.boost === RESOURCE_ZYNTHIUM_HYDRIDE) {
              dismantlePower += 2;
            } else if (bodyPart.boost === RESOURCE_ZYNTHIUM_ACID) {
              dismantlePower += 3;
            } else if (bodyPart.boost === RESOURCE_CATALYZED_ZYNTHIUM_ACID) {
              dismantlePower += 4;
            }
          } else {
            dismantlePower += 1;
          }
          break;
        case (TOUGH):
          if (bodyPart.boost) {
            if (bodyPart.boost === RESOURCE_GHODIUM_OXIDE) {
              effectiveHitPoints += 43;
            } else if (bodyPart.boost === RESOURCE_GHODIUM_ALKALIDE) {
              effectiveHitPoints += 100;
            } else if (bodyPart.boost === RESOURCE_CATALYZED_GHODIUM_ALKALIDE) {
              effectiveHitPoints += 233;
            }
          }
          break;
      }
    }

    return { attackPower, healPower, rangedAttackPower, dismantlePower, effectiveHitPoints };
  }
}