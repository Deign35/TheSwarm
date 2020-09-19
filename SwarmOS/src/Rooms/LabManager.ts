export const OSPackage: IPackage = {
  install(processRegistry: IProcessRegistry, extensionRegistry: IExtensionRegistry) {
    processRegistry.register(RPKG_LabManager, LabManager);
  }
}
import { BasicProcess } from "Core/BasicTypes";

class LabManager extends BasicProcess<LabManager_Memory, MemCache> {
  @extensionInterface(EXT_RoomManager)
  protected roomManager!: IRoomManagerExtension;
  RunThread(): ThreadState {
    const roomData = this.roomManager.GetRoomData(this.memory.homeRoom)!;
    if (Object.keys(roomData.labOrders).length > 0 && roomData.structures[STRUCTURE_TERMINAL].length > 0) {
      if (!this.memory.scientistPID || !this.kernel.getProcessByPID(this.memory.scientistPID)) {
        this.memory.scientistPID = this.kernel.startProcess(CPKG_Scientist, {
          expires: true,
          homeRoom: this.memory.homeRoom,
          targetRoom: this.memory.homeRoom
        } as Scientist_Memory);
        this.kernel.setParent(this.memory.scientistPID, this.pid);
      }
    }

    const labIDs = roomData.structures[STRUCTURE_LAB];
    let freeLabs = [];
    for (let id of labIDs) {
      if (!roomData.labOrders[id]) {
        roomData.labOrders[id] = {
          amount: 0,
          resourceType: RESOURCE_ENERGY
        }
      }

      const lab = Game.getObjectById<StructureLab>(id);
      if (!lab) {
        delete roomData.labOrders[id];
        continue;
      }
      const order = roomData.labOrders[id];

      if (order.isForBoost && order.amount <= 0) {
        freeLabs.push(lab);
      } else if (order.resourceType == RESOURCE_ENERGY) {
        freeLabs.push(lab);
      } else if (order.lab_2 && order.lab_3 && order.amount <= 0) {
        freeLabs.push(lab);
        const lab2 = Game.getObjectById<StructureLab>(order.lab_2);
        const lab3 = Game.getObjectById<StructureLab>(order.lab_3);
        if (!lab2 || !lab3) {
          continue;
        }

        freeLabs.push(lab2);
        freeLabs.push(lab3);
      }
    }

    if (freeLabs.length > 0) {
      for (let i = 0; i < roomData.labRequests.length; i++) {
        if (freeLabs.length == 0) { break; }
        const request = roomData.labRequests[i];
        if (!request.forBoost && freeLabs.length < 3) { continue; }

        if (request.forBoost) {
          const lab = freeLabs.pop()!;
          roomData.labOrders[lab.id] = {
            amount: request.amount,
            creepID: request.creepID,
            isForBoost: true,
            resourceType: request.resourceType
          };
          roomData.labRequests.splice(0, 1);
          continue;
        }

        let lab1ID = "";
        let lab2ID = "";
        let lab3ID = "";

        for (let j = 0; j < freeLabs.length; j++) {
          const neighbors = freeLabs[j].pos.findInRange(freeLabs, 2);
          if (neighbors.length >= 3) {
            lab1ID = freeLabs[j].id;
            for (let k = 0; k < neighbors.length; k++) {
              if (neighbors[k].id == lab1ID) { continue; }
              if (!lab2ID) { lab2ID = neighbors[k].id; continue; }
              if (!lab3ID) { lab3ID = neighbors[k].id; break; }
            }
          }

          if (lab1ID && lab2ID && lab3ID) {
            break;
          }
        }

        const reactionComponents = ReverseReactions[request.resourceType];
        if (request.reverseReaction) {
          roomData.labOrders[lab1ID] = {
            amount: request.amount,
            isReverse: true,
            lab_2: lab2ID,
            lab_3: lab3ID,
            resourceType: request.resourceType
          }

          roomData.labOrders[lab2ID] = {
            amount: request.amount,
            isOutput: true,
            resourceType: reactionComponents[0]
          }
          roomData.labOrders[lab3ID] = {
            amount: request.amount,
            isOutput: true,
            resourceType: reactionComponents[1]
          }
        } else {
          roomData.labOrders[lab1ID] = {
            amount: request.amount,
            isOutput: true,
            lab_2: lab2ID,
            lab_3: lab3ID,
            resourceType: request.resourceType
          }

          roomData.labOrders[lab2ID] = {
            amount: request.amount,
            resourceType: reactionComponents[0]
          }
          roomData.labOrders[lab3ID] = {
            amount: request.amount,
            resourceType: reactionComponents[1]
          }
        }
        roomData.labRequests.splice(0, 1);
        break;
      }
    }

    for (const labID in roomData.labOrders) {
      const order = roomData.labOrders[labID];
      const lab = Game.getObjectById<StructureLab>(labID);
      if (!lab) { continue; }

      if (order.isForBoost) {
        const creep = Game.creeps[order.creepID!];
        if (!creep) { continue; }
        if (lab.boostCreep(creep) == OK) {
          order.amount = 0;
        }
      } else if (order.lab_2 && order.lab_3) {
        const lab2 = Game.getObjectById<StructureLab>(order.lab_2);
        const lab3 = Game.getObjectById<StructureLab>(order.lab_3);

        if (!lab2 || !lab3) { continue; }
        if (order.isReverse) {
          if (lab.reverseReaction(lab2, lab3) == OK) {
            order.amount -= 5;
          }
        } else {
          if (lab.runReaction(lab2, lab3) == OK) {
            order.amount -= 5;
          }
        }
      }
    }

    return ThreadState_Done;
  }
}