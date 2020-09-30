import { BasicProcess } from "Core/BasicTypes";

export abstract class SoloCreep<T extends SoloCreep_Memory, U extends SoloCreep_Cache> extends BasicProcess<T, U> {
  @extensionInterface(EXT_CreepManager)
  creepManager!: ICreepManagerExtensions;
  @extensionInterface(EXT_MapManager)
  mapManager!: IMapManagerExtensions;
  @extensionInterface(EXT_RoomManager)
  roomManager!: IRoomManagerExtension;
  @extensionInterface(EXT_SpawnManager)
  spawnManager!: ISpawnManagerExtensions;
  @extensionInterface(EXT_TerminalNetwork)
  terminalNetwork!: ITerminalNetworkExtensions;

  PrepTick() {
    delete this.cache.lastAction;
  }

  RunThread(): ThreadState {
    let creep: Creep | undefined = undefined;
    if (this.memory.creepID) {
      creep = this.creepManager.tryGetCreep(this.memory.creepID, this.pid);
      if (creep && !creep.spawning) {
        if (!this.cache.curAction) {
          this.CreateActionForCreep(this.memory.creepID!);
        }

        if (!this.cache.curAction) {
          this.HandleNoActivity(creep);
        } else {
          // Execute current action.
          let target = undefined;
          if (this.cache.curAction.targetID) {
            target = Game.getObjectById<ObjectTypeWithID>(this.cache.curAction.targetID);
          } else if (this.cache.curAction.pos) {
            target = new RoomPosition(this.cache.curAction.pos.x || 0, this.cache.curAction.pos.y || 0, this.cache.curAction.pos.roomName);
          } else {
            target = creep.pos;
          }

          if (!target) {
            this.EndCurrentAction();
            return ThreadState_Waiting;
          }

          if (this.cache.curAction.action === AT_MoveToPosition) {
            const moveResult = this.RunCreepAction({
              actionType: AT_MoveToPosition,
              creep: creep,
              target: target,
              distance: this.cache.curAction.distance
            });
            if (moveResult == ERR_NOT_IN_RANGE || moveResult == ERR_BUSY || moveResult == ERR_TIRED) {
              // Not yet there
            } else if (moveResult == OK || moveResult === ERR_NO_PATH) {
              this.EndCurrentAction();
              return ThreadState_Waiting;
            }
            return ThreadState_Done;
          } else {
            if (!this.ValidateActionTarget(this.cache.curAction.action, target, this.cache.curAction.resourceType)) {
              this.EndCurrentAction();
              return ThreadState_Waiting;
            } else if (!this.CreepIsInRange(this.cache.curAction.action, creep.pos, target as RoomPosition)) {
              this.MoveCreep(creep, target as RoomPosition, this.cache.curAction.distance);
            } else {
              const result = this.RunCreepAction({
                actionType: this.cache.curAction.action,
                creep: creep,
                amount: this.cache.curAction.amount,
                distance: this.cache.curAction.distance,
                message: this.cache.curAction.message,
                resourceType: this.cache.curAction.resourceType,
                target: target,
              });
              switch (this.cache.curAction.action) {
                case (AT_ClaimController):
                case (AT_Drop):
                case (AT_GenerateSafeMode):
                case (AT_Pickup):
                case (AT_RequestTransfer):
                case (AT_SignController):
                case (AT_Suicide):
                case (AT_Transfer):
                case (AT_Withdraw):
                case (AT_NoOp):
                  this.EndCurrentAction();
                  return ThreadState_Waiting;
                case (AT_Build):
                  let build_creepCapacity = creep.store.getUsedCapacity(RESOURCE_ENERGY);
                  build_creepCapacity -= creep.getActiveBodyparts(WORK) * 5;
                  if (build_creepCapacity <= 0) {
                    this.EndCurrentAction();
                    return ThreadState_Waiting;
                  }
                case (AT_Repair):
                case (AT_Upgrade):
                  let creepCapacity = creep.store.getUsedCapacity(RESOURCE_ENERGY);
                  creepCapacity -= creep.getActiveBodyparts(WORK);
                  if (creepCapacity <= 0) {
                    this.EndCurrentAction();
                    return ThreadState_Waiting;
                  }
                case (AT_RenewCreep):
                  if (result == ERR_BUSY) {
                    this.EndCurrentAction();
                    return ThreadState_Waiting;
                  }
                default:
                  break;
              }

              if (result == OK || result == ERR_BUSY || result == ERR_TIRED || result == ERR_NOT_IN_RANGE) {
                return ThreadState_Done;
              }
              if (this.cache.curAction.exemptedFailures) {
                for (let i = 0; i < this.cache.curAction.exemptedFailures.length; i++) {
                  if (result == this.cache.curAction.exemptedFailures[i]) {
                    return ThreadState_Done;
                  }
                }
              }

              this.EndCurrentAction();
              return ThreadState_Waiting;
            }
          }
        }
      }
    }

    if (!creep) {
      delete this.memory.creepID;
      if (!this.memory.spawnID) {
        if (this.memory.expires && this.memory.hasRun) {
          this.EndProcess();
        } else {
          this.memory.spawnID = this.GetNewSpawnID();
        }
      } else {
        const status = this.spawnManager.getRequestStatus(this.memory.spawnID);
        switch (status) {
          case (SP_QUEUED):
            break;
          case (SP_COMPLETE):
          case (SP_SPAWNING):
            this.OnCreepSpawn(this.spawnManager.getRequestContext(this.memory.spawnID)!.creepName);
            break;
          case (SP_ERROR):
          default:
            this.EndProcess();
        }
      }
    }

    return ThreadState_Done;
  }
  protected abstract GetNewSpawnID(): string | undefined;

  protected OnCreepSpawn(creepID: CreepID) {
    this.creepManager.tryReserveCreep(creepID, this.pid);
    const creep = this.creepManager.tryGetCreep(creepID, this.pid);
    if (!creep) {
      this.log.error(`Creep spawned but couldn't register`);
      return;
    }
    this.spawnManager.cancelRequest(this.memory.spawnID!);
    this.memory.spawnID = undefined;
    this.memory.hasRun = true;
    this.memory.creepID = creepID;

    delete this.memory.needsBoost;
    if (this.RequestBoost(creep)) {
      this.memory.needsBoost = true;
    }
  }
  protected abstract RequestBoost(creep: Creep): boolean;

  EndCurrentAction() {
    this.cache.lastAction = this.cache.curAction;
    delete this.cache.curAction;
  }
  CreateActionForCreep(creepID: CreepID) {
    this.creepManager.tryReserveCreep(creepID, this.pid);
    const creep = this.creepManager.tryGetCreep(creepID, this.pid);
    this.memory.creepID = creepID;
    if (!creep) {
      if (this.memory.expires) {
        this.EndProcess();
      }
      return;
    }

    const roomData = this.roomManager.GetRoomData(creep.room.name)!;
    if (this.memory.needsBoost) {
      const labIDs = Object.keys(roomData.labOrders);
      for (let i = 0; i < labIDs.length; i++) {
        const order = roomData.labOrders[labIDs[i]];
        if (order.creepIDs && order.creepIDs.includes(creep.name) && order.amount > 0) {
          this.cache.curAction = {
            action: AT_MoveToPosition,
            distance: 1,
            targetID: labIDs[i]
          }
        }
      }
      // If we're here then no boost orders are present
      delete this.memory.needsBoost;
    } else {
      this.cache.curAction = this.CreateCustomCreepAction(creep);
    }
  }
  protected abstract CreateCustomCreepAction(creep: Creep): SoloCreepAction | undefined;
  protected HandleNoActivity(creep: Creep) {
    this.EndProcess();
  }

  OnEndProcess() {
    if (this.memory.creepID) {
      this.creepManager.releaseCreep(this.memory.creepID, this.pid);
    }
    if (this.memory.spawnID) {
      this.spawnManager.cancelRequest(this.memory.spawnID);
    }
  }

  MoveToRoom(creep: Creep, targetRoom: RoomID): SoloCreepAction | undefined {
    const route = this.mapManager.GetRoute(creep.room.name, targetRoom);
    if (route == -2) { return; }
    let exit = null;
    if (route.length > 0) {
      exit = creep.pos.findClosestByPath(route[0].exit);
    }
    if (!exit) { return; }
    return {
      action: AT_MoveToPosition,
      pos: exit,
      distance: 0
    }
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

  MoveCreep(creep: Creep, pos: RoomPosition, range?: number) {
    return creep.moveTo(pos, {
      visualizePathStyle: {
        lineStyle: "dashed",
        opacity: 0.5,
        stroke: "red",
        strokeWidth: 0.2,
      },
      range: range
    });
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
}