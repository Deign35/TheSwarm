export const OSPackage: IPackage = {
  install(processRegistry: IProcessRegistry, extensionRegistry: IExtensionRegistry) {
    processRegistry.register(CPKG_Scientist, Scientist);
  }
}
import { SoloJob } from "./SoloJob";

class Scientist extends SoloJob<Scientist_Memory, MemCache> {
  protected GetNewSpawnID(): string {
    return this.spawnManager.requestSpawn({
      body: [CARRY, CARRY, CARRY, CARRY, MOVE, MOVE],
      creepName: this.memory.homeRoom + "_" + (Game.time + '_Sci').slice(-7),
      owner_pid: this.pid
    }, this.memory.homeRoom, Priority_Medium, {
        parentPID: this.pid
      }, 0);
  }
  protected CreateCustomCreepActivity(creep: Creep): PID | undefined {
    const roomData = this.roomManager.GetRoomData(this.memory.homeRoom)!;
    const terminal = creep.room.terminal;
    if (!terminal) {
      this.log.error(`Room(${creep.room.name}) doesn't have a terminal.`)
      return;
    }

    if (creep.ticksToLive && creep.ticksToLive < 50 && creep.store.getUsedCapacity() == 0) {
      return this.creepManager.CreateNewCreepActivity({
        action: AT_Suicide,
        creepID: creep.name,
        pos: creep.pos
      }, this.pid);
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
          if (!order.isForBoost) {
            order.amount -= amount;
          }
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
          break;
        }

        // If the order is an output, then see if we can dump some of it out to make room for more.
        if (order.isOutput && lab.mineralType && lab.store.getUsedCapacity(lab.mineralType) >= halfCapacity) {
          curAction = AT_Withdraw;
          actionResource = lab.mineralType;
          target = labID;
          amount = Math.min(lab.store.getUsedCapacity(lab.mineralType), creepCapacity);
          break;
        }

        // If the order is an input, then see if we can and should deposit more resources.
        if (!order.isOutput && order.amount > 0 && lab.store.getFreeCapacity(order.resourceType) >= creepCapacity &&
          terminal.store.getUsedCapacity(order.resourceType) > 0 && lab.store.getUsedCapacity(order.resourceType) < 2000) {
          curAction = AT_Withdraw;
          actionResource = order.resourceType;
          target = terminal.id;
          amount = Math.min(order.amount, terminal.store.getUsedCapacity(order.resourceType), creepCapacity);
        }
      }
    }

    if (curAction == AT_NoOp) {
      return this.creepManager.CreateNewCreepActivity({
        action: AT_MoveToPosition,
        amount: 1,
        creepID: creep.name,
        targetID: terminal.id
      }, this.pid);
    }
    return this.creepManager.CreateNewCreepActivity({
      action: curAction,
      creepID: creep.name,
      resourceType: actionResource,
      targetID: target,
      amount: amount
    }, this.pid);
  }

  HandleNoActivity(creep: Creep) { }
}