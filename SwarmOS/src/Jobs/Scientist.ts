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
      creepName: this.memory.homeRoom + (Game.time + '_Sci').slice(-7),
      owner_pid: this.pid
    }, this.memory.homeRoom, Priority_Lowest, {
        parentPID: this.pid
      }, 3);
  }
  protected CreateCustomCreepActivity(creep: Creep): PID | undefined {
    const roomData = this.roomManager.GetRoomData(this.memory.homeRoom)!;
    const terminal = creep.room.terminal;
    if (!terminal) {
      this.log.error(`Room(${creep.room.name}) doesn't have a terminal.`)
      return;
    }

    let curAction: ActionType = AT_NoOp;
    let actionResource: ResourceConstant = RESOURCE_ENERGY;
    let target: ObjectID = terminal.id;
    const creepCapacity = creep.store.getCapacity();
    const halfCapacity = creepCapacity / 2;
    for (let order of roomData.labOrders) {
      if (creep.store.getUsedCapacity() > 0) {
        if (creep.store[order.input_1.mineral] > 0) {
          let lab = Game.getObjectById<StructureLab>(order.input_1.lab_id);
          if (!lab) { continue; }
          if (lab.mineralType != undefined && lab.mineralType != order.input_1.mineral) {
            curAction = AT_Transfer;
            actionResource = order.input_1.mineral;
            target = terminal.id;
            break;
          }
          if (lab.mineralType == undefined || lab.store[order.input_1.mineral] <= halfCapacity) {
            curAction = AT_Transfer;
            actionResource = order.input_1.mineral;
            target = lab.id;
            break;
          }
        } else if (creep.store[order.input_2.mineral] > 0) {
          let lab = Game.getObjectById<StructureLab>(order.input_2.lab_id);
          if (!lab) { continue; }
          if (lab.mineralType != undefined && lab.mineralType != order.input_2.mineral) {
            curAction = AT_Transfer;
            actionResource = order.input_2.mineral;
            target = terminal.id;
            break;
          }
          if (lab.mineralType == undefined || lab.store[order.input_2.mineral] <= halfCapacity) {
            curAction = AT_Transfer;
            actionResource = order.input_2.mineral;
            target = lab.id;
            break;
          }
        }
      } else {
        let lab1 = Game.getObjectById<StructureLab>(order.input_1.lab_id);
        if (!lab1) { continue; }
        if (lab1.mineralType && lab1.mineralType != order.input_1.mineral) {
          curAction = AT_Withdraw;
          target = lab1.id;
          actionResource = lab1.mineralType;
          break;
        }
        let lab2 = Game.getObjectById<StructureLab>(order.input_2.lab_id);
        if (!lab2) { continue; }
        if (lab2.mineralType && lab2.mineralType != order.input_2.mineral) {
          curAction = AT_Withdraw;
          target = lab2.id;
          actionResource = lab2.mineralType;
          break;
        }
        let lab3 = Game.getObjectById<StructureLab>(order.output_id);
        if (!lab3) { continue; }
        if (lab3.mineralType && (order.input_1.mineral == RESOURCE_ENERGY ||
          order.input_2.mineral == RESOURCE_ENERGY ||
          lab3.mineralType != REACTIONS[order.input_1.mineral][order.input_2.mineral] ||
          lab3.store.getUsedCapacity(lab3.mineralType) > halfCapacity)) {

          curAction = AT_Withdraw;
          target = lab3.id;
          actionResource = lab3.mineralType;
          break;
        }

        if (lab1.store[order.input_1.mineral] < halfCapacity && terminal.store[order.input_1.mineral] > 0) {
          curAction = AT_Withdraw;
          target = terminal.id;
          actionResource = order.input_1.mineral;
          break;
        }
        if (lab2.store[order.input_2.mineral] < halfCapacity && terminal.store[order.input_2.mineral] > 0) {
          curAction = AT_Withdraw;
          target = terminal.id;
          actionResource = order.input_2.mineral;
          break;
        }
      }
    }

    if (actionResource == RESOURCE_ENERGY && creep.store.getUsedCapacity() > 0) {
      curAction = AT_Transfer;
      target = terminal.id;
      for (let resourceType in creep.store) {
        actionResource = resourceType as MineralCompoundConstant | MineralConstant;
        break;
      }
    }

    if (actionResource == RESOURCE_ENERGY && creep.store.getUsedCapacity() == 0) {
      for (let i = 0; i < roomData.tombstones.length; i++) {
        const tombstone = Game.getObjectById<Tombstone>(roomData.tombstones[i]);
        if (tombstone) {
          for (let key in tombstone.store) {
            if (key != RESOURCE_ENERGY) {
              curAction = AT_Withdraw;
              actionResource = key as ResourceConstant;
              target = tombstone.id;
            }
          }
        }
      }
    }

    return this.creepManager.CreateNewCreepActivity({
      action: curAction,
      creepID: creep.name,
      resourceType: actionResource,
      targetID: target
    }, this.pid);
  }

  HandleNoActivity() { }
}