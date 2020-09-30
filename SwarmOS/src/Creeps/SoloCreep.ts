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
            const moveResult = this.creepManager.RunCreepAction({
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
            if (!this.creepManager.ValidateActionTarget(this.cache.curAction.action, target, this.cache.curAction.resourceType)) {
              this.EndCurrentAction();
              return ThreadState_Waiting;
            } else if (!this.creepManager.CreepIsInRange(this.cache.curAction.action, creep.pos, target as RoomPosition)) {
              this.creepManager.MoveCreep(creep, target as RoomPosition, this.cache.curAction.distance);
            } else {
              const result = this.creepManager.RunCreepAction({
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
      if (!this.memory.spawnID) {
        if (this.memory.expires && this.memory.hasRun) {
          this.EndProcess();
        } else {
          delete this.memory.creepID;
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
}