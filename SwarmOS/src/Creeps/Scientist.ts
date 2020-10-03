export const OSPackage: IPackage = {
  install(processRegistry: IProcessRegistry, extensionRegistry: IExtensionRegistry) {
    processRegistry.register(CPKG_Scientist, Scientist);
  }
}
import { SoloCreep } from "./SoloCreep";

class Scientist extends SoloCreep<Scientist_Memory, Scientist_Cache> {
  protected RequestBoost(creep: Creep): boolean {
    return false;
  }
  protected GetNewSpawnID(): string {
    return this.spawnManager.requestSpawn({
      body: [CARRY, CARRY, CARRY, CARRY, MOVE, MOVE],
      creepName: this.memory.targetRoom + "_" + (Game.time + '_Sci').slice(-7),
      owner_pid: this.pid
    }, this.memory.homeRoom, Priority_Medium, {
        parentPID: this.pid
      }, 0);
  }
  protected CreateCustomCreepAction(creep: Creep): SoloCreepAction | undefined {
    const roomData = this.roomManager.GetRoomData(this.memory.homeRoom)!;
    const terminal = creep.room.terminal;
    if (!terminal) {
      this.log.error(`Room(${creep.room.link}) doesn't have a terminal.`)
      return;
    }
    if (this.cache.lastAction) {
      if (this.cache.curOrder && this.cache.lastAction.action == AT_Transfer) {
        const order = roomData.labOrders[this.cache.curOrder];
        if (!order.isForBoost) {
          order.amount -= creep.store.getUsedCapacity(order.resourceType);
        }
        delete this.cache.curOrder;
        return {
          action: AT_MoveToPosition,
          targetID: terminal.id,
          distance: 1
        }
      } else if (this.cache.curOrder && this.cache.lastAction.action == AT_Withdraw) {
        delete this.cache.curOrder;
        return {
          action: AT_MoveToPosition,
          targetID: this.cache.curOrder,
          distance: 1
        }
      }
    }

    if (creep.ticksToLive && creep.ticksToLive < 50 && creep.store.getUsedCapacity() == 0) {
      return {
        action: AT_Suicide,
        pos: creep.pos
      }
    }

    let curAction: ActionType = AT_NoOp;
    let actionResource: ResourceConstant = RESOURCE_ENERGY;
    let target: ObjectID = terminal.id;
    let amount: number = creep.store.getCapacity();
    const creepCapacity = creep.store.getCapacity();
    const halfCapacity = creepCapacity / 2;

    if (creep.store.getUsedCapacity() > 0) {
      // Find a place to dump it
      for (let labID in roomData.labOrders) {
        const order = roomData.labOrders[labID];
        const lab = Game.getObjectById<StructureLab>(labID);
        if (!lab) { continue; }

        // If the creep has resources, find a place to deposit
        if (creep.store[order.resourceType] > 0 && order.resourceType != RESOURCE_ENERGY &&
          !order.isOutput && order.amount > 0 && (!lab.mineralType || lab.mineralType == order.resourceType)) {
          curAction = AT_Transfer;
          actionResource = order.resourceType;
          target = labID;
          amount = Math.min(creep.store.getUsedCapacity(actionResource), order.amount);
          this.cache.curOrder = labID;
          break;
        }
      }

      // If no place to deposit, then put it in the terminal
      if (curAction == AT_NoOp) {
        curAction = AT_Transfer;
        actionResource = Object.keys(creep.store)[0] as ResourceConstant;
        target = terminal.id;
        amount = creep.store.getUsedCapacity(actionResource);
      }
    } else {
      for (let labID in roomData.labOrders) {
        const order = roomData.labOrders[labID];
        const lab = Game.getObjectById<StructureLab>(labID);
        if (!lab) { continue; }

        // Check that if a lab has a mineralType that does not match the order, then empty it.
        if (lab.mineralType && (order.resourceType == RESOURCE_ENERGY || order.resourceType != lab.mineralType)) {
          curAction = AT_Withdraw;
          actionResource = lab.mineralType;
          target = labID;
          amount = Math.min(lab.store.getUsedCapacity(lab.mineralType), creep.store.getFreeCapacity());
          this.cache.curOrder = labID;
          break;
        }

        // If the order is an output, then see if we can dump some of it out to make room for more.
        if (order.isOutput && lab.mineralType && lab.store.getUsedCapacity(lab.mineralType) >= halfCapacity) {
          curAction = AT_Withdraw;
          actionResource = lab.mineralType;
          target = labID;
          amount = Math.min(lab.store.getUsedCapacity(lab.mineralType), creepCapacity);
          this.cache.curOrder = labID;
          break;
        }

        // If the order is an input, then see if we can and should deposit more resources.
        if (!order.isOutput && order.amount > 0 && lab.store.getFreeCapacity(order.resourceType) >= creepCapacity &&
          terminal.store.getUsedCapacity(order.resourceType) > 0 && lab.store.getUsedCapacity(order.resourceType) < 2000) {
          curAction = AT_Withdraw;
          actionResource = order.resourceType;
          target = terminal.id;
          amount = Math.min(order.amount, terminal.store.getUsedCapacity(order.resourceType), creepCapacity);
          this.cache.curOrder = labID;
          break;
        }
      }
    }

    if (curAction == AT_NoOp) {
      if (roomData.terminalRequests.length > 0) {
        const request = roomData.terminalRequests.pop()!;
        curAction = AT_Withdraw;
        target = creep.room.storage!.id;
        actionResource = request.resourceType;
        amount = Math.min(request.amount, creep.store.getFreeCapacity());
        if (amount < request.amount) {
          request.amount -= amount;
          roomData.terminalRequests.push(request);
        }
      }
    }

    if (curAction == AT_NoOp) {
      for (let i = 0; i < roomData.tombstones.length; i++) {
        const tombstone = Game.getObjectById<Tombstone>(roomData.tombstones[i]);
        if (tombstone) {
          for (let key in tombstone.store) {
            if (key != RESOURCE_ENERGY) {
              curAction = AT_Withdraw;
              actionResource = key as ResourceConstant;
              target = tombstone.id;
              amount = tombstone.store.getUsedCapacity(actionResource);
              break;
            }
          }
        }

        if (curAction != AT_NoOp) { break; }
      }
    }

    if (curAction == AT_NoOp) {
      return {
        action: AT_MoveToPosition,
        distance: 1,
        targetID: terminal.id
      }
    }
    return {
      action: curAction,
      resourceType: actionResource,
      targetID: target,
      amount: amount
    }
  }

  HandleNoActivity(creep: Creep) { }
}