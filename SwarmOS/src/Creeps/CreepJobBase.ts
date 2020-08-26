import { BasicProcess } from "Core/BasicTypes";

export abstract class CreepJobBase<T extends CreepMemBase> extends BasicProcess<T> {
  @extensionInterface(EXT_CreepManager)
  creepManager!: ICreepManagerExtensions;
  @extensionInterface(EXT_RoomManager)
  roomManager!: IRoomManagerExtension;
  @extensionInterface(EXT_SpawnManager)
  spawnManager!: ISpawnManagerExtensions;

  AssignedCreep?: Creep;

  PrepTick() {
    this.AssignedCreep = this.creepManager.tryGetCreep(this.memory.creepID, this.pid);
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