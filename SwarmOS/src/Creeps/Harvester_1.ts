export const OSPackage: IPackage = {
  install(processRegistry: IProcessRegistry, extensionRegistry: IExtensionRegistry) {
    processRegistry.register(CPKG_Harvester_1, Harvester_1);
  }
}

import { BasicProcess } from "Core/BasicTypes";

const CPKG_Harvester_1_LogContext: LogContext = {
  logID: CPKG_Harvester_1,
  logLevel: LOG_TRACE
}

class Harvester_1 extends BasicProcess<Harvester_1_Memory> {
  @extensionInterface(EXT_CreepManager)
  creepManager!: ICreepManagerExtensions;
  @extensionInterface(EXT_RoomManager)
  roomManager!: IRoomManagerExtension;
  @extensionInterface(EXT_SpawnManager)
  spawnManager!: ISpawnManagerExtensions;

  protected get logID(): string {
    return CPKG_Harvester_1_LogContext.logID;
  }
  protected get logLevel(): LogLevel {
    return CPKG_Harvester_1_LogContext.logLevel;
  }

  RunThread(): ThreadState {
    let harvester = this.GetCreep(this.memory.harvester, 'Harvester', [WORK, WORK, MOVE]);
    if (harvester) {
      let target = Game.getObjectById(this.memory.harvester.target) as Source;
      if (target && this.ValidateActionTarget(AT_Harvest, target)) {
        if (this.CreepIsInRange(AT_Harvest, harvester.pos, target.pos)) {
          this.RunCreepAction({
            actionType: AT_Harvest,
            creep: harvester,
            target: target
          });
        } else {
          this.MoveCreep(harvester, target.pos);
        }
      }
    }

    let gatherer = this.GetCreep(this.memory.gatherer, 'Gatherer', [CARRY, CARRY, MOVE, MOVE]);
    if (gatherer) {
      if (!this.memory.gatherer.gathering) {
        if (gatherer.store.getUsedCapacity() == 0) {
          this.memory.gatherer.gathering = true;
        }
      }

      if (this.memory.gatherer.gathering) {
        if (harvester) {
          let resources = gatherer.room.lookForAt(LOOK_ENERGY, harvester.pos);
          if (resources.length > 0) {
            let target = resources[0];
            if (target && this.ValidateActionTarget(AT_Pickup, target)) {
              if (this.CreepIsInRange(AT_Pickup, gatherer.pos, target.pos)) {
                if (this.RunCreepAction({
                  actionType: AT_Pickup,
                  creep: gatherer,
                  target: target
                }) == OK) {
                  this.memory.gatherer.gathering = false;
                }
              } else {
                this.MoveCreep(gatherer, target.pos);
              }
            }
          }
        }
      } else {
        let spawns = gatherer.room.find(FIND_MY_SPAWNS);
        if (spawns.length > 0) {
          let target = spawns[0];
          if (target && this.ValidateActionTarget(AT_Transfer, target)) {
            if (this.CreepIsInRange(AT_Transfer, gatherer.pos, target.pos)) {
              if (this.RunCreepAction({
                actionType: AT_Transfer,
                creep: gatherer,
                target: target
              }) == OK) {
                this.memory.gatherer.gathering = true;
              }
            } else {
              this.MoveCreep(gatherer, target.pos);
            }
          }
        }
      }
    }

    return ThreadState_Done;
  }

  GetCreep(creepRole: CreepRoleMemory, creepName: string, creepBody: BodyPartConstant[]) {
    let creep = this.creepManager.tryGetCreep(creepRole.creepID, this.pid);
    if (!creep || (!creep.spawning && creep.ticksToLive! < 100)) {
      let spawnStatus = this.spawnManager.getRequestStatus(creepRole.spawnID);
      if (spawnStatus == SP_ERROR) {
        creepRole.spawnID = this.spawnManager.requestSpawn({
          creepName: this.memory.roomID + '_' + creepName + '_' + GetRandomIndex(primes_1000),
          body: creepBody,
          owner_pid: this.pid
        }, this.memory.roomID, Priority_High, {
            parentPID: this.pid
          }, 3);
      } else {
        if (spawnStatus == SP_SPAWNING || spawnStatus == SP_COMPLETE) {
          let spawnContext = this.spawnManager.getRequestContext(creepRole.spawnID)!;
          if (this.spawnManager.cancelRequest(creepRole.spawnID)) {
            if (creep) {
              creep.suicide();
            }
            creepRole.creepID = spawnContext.creepName;
            this.creepManager.tryReserveCreep(spawnContext.creepName, this.pid);
          }
        }
      }
    }

    return creep;
  }

  protected GetLinearDistance(pos1: { x: number, y: number }, pos2: { x: number, y: number }) {
    let xDiff = pos1.x - pos2.x;
    xDiff *= xDiff < 0 ? -1 : 1;
    let yDiff = pos1.y - pos2.y;
    yDiff *= yDiff < 0 ? -1 : 1;
    return xDiff > yDiff ? xDiff : yDiff;
  }

  RunCreepAction(args: CreepActionArgs) {
    let creep = args.creep;
    let actionType = args.actionType;
    let target = args.target;
    switch (actionType) {
      case (AT_Attack): return creep.attack(target);
      case (AT_AttackController): return creep.attackController(target);
      case (AT_Build): return creep.build(target);
      case (AT_ClaimController): return creep.claimController(target);
      case (AT_Dismantle): return creep.dismantle(target);
      case (AT_GenerateSafeMode): return creep.generateSafeMode(target);
      case (AT_Harvest):
        let res = creep.harvest(target);
        if (res == OK && creep.store[RESOURCE_ENERGY] == creep.store.getCapacity()) {
          return ERR_FULL;
        }
        return res;
      case (AT_Heal): return creep.heal(target);
      case (AT_Pickup): return creep.pickup(target);
      case (AT_RangedAttack): return creep.rangedAttack(target);
      case (AT_RangedHeal): return creep.rangedHeal(target);
      case (AT_Repair):
        if ((target as Structure).hits == (target as Structure).hitsMax) {
          return ERR_INVALID_TARGET;
        }
        return creep.repair(target);
      case (AT_ReserveController): return creep.reserveController(target);
      case (AT_Upgrade): return creep.upgradeController(target);

      case (AT_RequestTransfer):
        if (target.transfer) {
          return target.transfer(creep, args.resourceType || RESOURCE_ENERGY, args.amount || 0);
        }
        break;
      case (AT_SignController): return creep.signController(target, args.message || '');
      case (AT_Transfer): return creep.transfer(target, args.resourceType || RESOURCE_ENERGY, args.amount || 0);
      case (AT_Withdraw): return creep.withdraw(target, args.resourceType || RESOURCE_ENERGY, args.amount || 0);

      case (AT_Drop): return creep.drop(args.resourceType || RESOURCE_ENERGY, args.amount || 0);
      case (AT_MoveByPath):
        break;
      case (AT_MoveToPosition):
        if ((target as Structure).pos) {
          target = (target as Structure).pos;
        }
        let result = creep.moveTo(target);
        let dist = creep.pos.getRangeTo(target);
        if (dist <= (args.amount || 0)) {
          if (creep.pos.isNearTo(target)) {
            let creeps = (target as RoomPosition).lookFor(LOOK_CREEPS);
            if (creeps.length > 0 && creeps[0].name != creep.name) {
              return ERR_NO_PATH;
            }
            return result;
          }
        } else {
          return ERR_NOT_IN_RANGE;
        }
      case (AT_RangedMassAttack): return creep.rangedMassAttack();
      case (AT_Suicide): return creep.suicide();
      case (AT_NoOp): return OK;
    }

    return ERR_INVALID_ARGS;
  }

  MoveCreep(creep: Creep, pos: RoomPosition) {
    return creep.moveTo(pos);
  }

  CreepIsInRange(actionType: ActionType, pos1: RoomPosition, pos2: RoomPosition) {
    let distance = this.GetLinearDistance(pos1, pos2);
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

  ValidateActionTarget(actionType: ActionType, target: any) {
    switch (actionType) {
      case (AT_Attack): return !!(target as Creep | Structure).hitsMax;
      case (AT_AttackController): return (target as Structure).structureType == STRUCTURE_CONTROLLER;
      case (AT_Build): return (target as ConstructionSite).structureType && !(target as Structure).hitsMax;
      case (AT_ClaimController): return (target as Structure).structureType == STRUCTURE_CONTROLLER;
      case (AT_Dismantle): return (target as Structure).structureType && !!(target as Structure).hitsMax;
      case (AT_GenerateSafeMode): return (target as Structure).structureType == STRUCTURE_CONTROLLER;
      case (AT_Harvest): return !(target as Structure).structureType && (!!(target as Source).energyCapacity || !!(target as Mineral).mineralType);
      case (AT_Heal): return !!(target as Creep).ticksToLive;
      case (AT_Pickup): return !!(target as Resource).resourceType;
      case (AT_RangedAttack): return !!(target as Creep | Structure).hitsMax
      case (AT_RangedHeal): return !!(target as Creep | Structure).hitsMax
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
          if ((target as StructureStorage).energy < (target as StructureTerminal).energyCapacity) {
            return true;
          }
        } else {
          if ((target as Creep).store[RESOURCE_ENERGY] < (target as Creep).store.getCapacity() * 0.8) {
            return true;
          }
        }
        return false;
      case (AT_Withdraw): return (target as Structure).structureType && !!(target as StructureContainer).store;

      case (AT_Drop):
      case (AT_MoveByPath):
      case (AT_MoveToPosition):
      case (AT_RangedMassAttack):
      case (AT_Suicide):
      case (AT_NoOp):
      default:
        return target && !!(target as RoomPosition).isNearTo;
    }
  }
}