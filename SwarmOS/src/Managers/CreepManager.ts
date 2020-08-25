declare var Memory: {
  creepData: CreepManager_Memory;
  creeps: SDictionary<CreepMemory>;
}

import { BasicProcess, ExtensionBase } from "Core/BasicTypes";

export const OSPackage: IPackage = {
  install(processRegistry: IProcessRegistry, extensionRegistry: IExtensionRegistry) {
    processRegistry.register(PKG_CreepManager, CreepManager);
    extensionRegistry.register(EXT_CreepManager, new CreepManagerExtensions(extensionRegistry));
    extensionRegistry.register(EXT_CreepActions, new CreepActionExtensions(extensionRegistry));
  }
}

const PKG_CreepManager_LogContext: LogContext = {
  logID: PKG_CreepManager,
  logLevel: LOG_INFO
}

class CreepManager extends BasicProcess<CreepManager_Memory> {
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
    let creepIDs = Object.keys(this.registeredCreeps);
    for (let i = 0; i < creepIDs.length; i++) {
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
    let creepIDs = Object.keys(Game.creeps);
    for (let i = 0, length = creepIDs.length; i < length; i++) {
      let creep = Game.creeps[creepIDs[i]];
      let context = this.registeredCreeps[creep.name];
      if (!context) {
        if (!this.creepExtensions.tryRegisterCreep(creep.name)) {
          this.log.error(`Creep context doesnt exist and couldnt register the creep(${creep.name}).`);
          continue;
        }
      }
    }

    return ThreadState_Done;
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
    let creepData = this.registeredCreeps[id];
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
}

class CreepActionExtensions extends ExtensionBase implements ICreepActionExtensions {
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