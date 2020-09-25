export const OSPackage: IPackage = {
  install(processRegistry: IProcessRegistry, extensionRegistry: IExtensionRegistry) {
    processRegistry.register(RPKG_LabManager, LabManager);
  }
}
import { BasicProcess } from "Core/BasicTypes";

class LabManager extends BasicProcess<LabManager_Memory, MemCache> {
  @extensionInterface(EXT_RoomManager)
  protected roomManager!: IRoomManagerExtension;
  @extensionInterface(EXT_TerminalNetwork)
  protected terminalNetwork!: ITerminalNetworkExtensions;

  RunThread(): ThreadState {
    const roomData = this.roomManager.GetRoomData(this.memory.homeRoom)!;
    let freeLabs = [];
    const labIDs = roomData.structures[STRUCTURE_LAB];
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

      if (order.resourceType == RESOURCE_ENERGY) {
        freeLabs.push(lab);
      } else if (order.isForBoost && order.amount <= 0) {
        freeLabs.push(lab);
        roomData.labOrders[id] = {
          amount: 0,
          resourceType: RESOURCE_ENERGY
        }
      } else if (order.lab_2 && order.lab_3 && order.amount <= 0) {
        freeLabs.push(lab);
        roomData.labOrders[id] = {
          amount: 0,
          resourceType: RESOURCE_ENERGY
        }
        const lab2 = Game.getObjectById<StructureLab>(order.lab_2);
        const lab3 = Game.getObjectById<StructureLab>(order.lab_3);
        if (!lab2 || !lab3) {
          continue;
        }

        freeLabs.push(lab2);
        freeLabs.push(lab3);
        roomData.labOrders[order.lab_2] = {
          amount: 0,
          resourceType: RESOURCE_ENERGY
        }
        roomData.labOrders[order.lab_3] = {
          amount: 0,
          resourceType: RESOURCE_ENERGY
        }
      }
    }

    if (roomData.labRequests.length > 0) {
      for (let i = 0; i < roomData.labRequests.length; i++) {
        const request = roomData.labRequests[i];
        const labOrders = Object.keys(roomData.labOrders);
        let foundExistingOrder = false;
        for (let j = 0; j < labOrders.length; j++) {
          const order = roomData.labOrders[labOrders[j]];
          if (order.resourceType == request.resourceType) {
            if (request.forBoost) {
              if (order.isForBoost) {
                foundExistingOrder = true;
                order.amount += request.amount;
                order.creepIDs!.push(request.creepID!);
                this.RequestResourcesIfNeeded(labOrders[j], order.resourceType, order.amount);
                break;
              }
            } else if (order.lab_2 && order.lab_3 && !!order.isReverse == !!request.reverseReaction) {
              foundExistingOrder = true;
              order.amount += request.amount;

              const order2 = roomData.labOrders[order.lab_2];
              order2.amount += request.amount;

              const order3 = roomData.labOrders[order.lab_3];
              order3.amount += request.amount;

              if (order.isReverse) {
                this.RequestResourcesIfNeeded(labOrders[j], order.resourceType, order.amount);
              } else {
                this.RequestResourcesIfNeeded(order.lab_2, order2.resourceType, order2.amount);
                this.RequestResourcesIfNeeded(order.lab_3, order3.resourceType, order3.amount);
              }
              break;
            }
          }
        }

        if (foundExistingOrder) {
          roomData.labRequests.splice(i--, 1);
          continue;
        }
        if (freeLabs.length == 0) { break; }
        if (!request.forBoost && freeLabs.length < 3) { continue; }

        if (request.forBoost) {
          const lab = freeLabs.pop()!;
          roomData.labOrders[lab.id] = {
            amount: request.amount,
            creepIDs: [request.creepID!],
            isForBoost: true,
            resourceType: request.resourceType
          };
          this.RequestResourcesIfNeeded(lab.id, request.resourceType, request.amount);
          roomData.labRequests.splice(i--, 1);
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
          this.RequestResourcesIfNeeded(lab1ID, request.resourceType, request.amount);

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
          this.RequestResourcesIfNeeded(lab2ID, reactionComponents[0], request.amount);

          roomData.labOrders[lab3ID] = {
            amount: request.amount,
            resourceType: reactionComponents[1]
          }
          this.RequestResourcesIfNeeded(lab3ID, reactionComponents[1], request.amount);
        }
        roomData.labRequests.splice(i--, 1);
        break;
      }
    }

    let hasOtherOrders = false;
    let hasBoostOrders = false;
    for (const labID in roomData.labOrders) {
      const order = roomData.labOrders[labID];
      const lab = Game.getObjectById<StructureLab>(labID);
      if (!lab) { continue; }

      if (order.isForBoost && order.creepIDs) {
        hasBoostOrders = true;
        for (let i = 0; i < order.creepIDs.length; i++) {
          const creep = Game.creeps[order.creepIDs[i]!];
          if (!creep || creep.pos.getRangeTo(lab) > 1) { continue; }
          if (lab.boostCreep(creep) == OK) {
            order.amount -= creep.getActiveBodyparts(ResourceToPart[lab.mineralType!]) * 30;
            order.creepIDs.splice(order.creepIDs.indexOf(creep.name), 1);
          }
        }
      } else if (order.lab_2 && order.lab_3) {
        hasOtherOrders = true;
        const lab2 = Game.getObjectById<StructureLab>(order.lab_2);
        const lab3 = Game.getObjectById<StructureLab>(order.lab_3);
        if (!lab2 || !lab3 ||
          lab2.mineralType != roomData.labOrders[order.lab_2].resourceType ||
          lab3.mineralType != roomData.labOrders[order.lab_3].resourceType) { continue; }

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

    if ((hasOtherOrders || hasBoostOrders) && roomData.structures[STRUCTURE_TERMINAL].length > 0 && roomData.structures[STRUCTURE_LAB].length > 0) {
      if (!this.memory.scientistPID || !this.kernel.getProcessByPID(this.memory.scientistPID)) {
        this.memory.scientistPID = this.kernel.startProcess(CPKG_Scientist, {
          expires: true,
          homeRoom: this.memory.homeRoom,
          targetRoom: this.memory.homeRoom
        } as Scientist_Memory);
        this.kernel.setParent(this.memory.scientistPID, this.pid);
      }
    }

    if (!hasBoostOrders) {
      this.sleeper.sleep(this.pid, 5);
    }
    return ThreadState_Done;
  }

  RequestResourcesIfNeeded(labID: ObjectID, resourceType: ResourceConstant, amount: number) {
    const room = Game.rooms[this.memory.homeRoom];
    const lab = Game.getObjectById<StructureLab>(labID)!;
    let requiredAmount = amount;
    requiredAmount -= lab.store.getUsedCapacity(resourceType) || 0;
    requiredAmount -= (room.terminal ? room.terminal.store.getUsedCapacity(resourceType) : 0);
    if (requiredAmount > 0) {
      this.terminalNetwork.RequestResources({
        amount: requiredAmount,
        resourceType: resourceType,
        roomID: this.memory.homeRoom
      })
    }
  }
}