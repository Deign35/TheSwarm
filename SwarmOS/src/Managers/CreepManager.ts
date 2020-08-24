declare var Memory: {
  creepData: CreepManager_Memory;
  creeps: SDictionary<CreepMemory>;
}

import { BasicProcess, ExtensionBase } from "Core/BasicTypes";

export const OSPackage: IPackage<CreepManager_Memory> = {
  install(processRegistry: IProcessRegistry, extensionRegistry: IExtensionRegistry) {
    processRegistry.register(PKG_CreepManager, CreepManager);
    extensionRegistry.register(EXT_CreepManager, new CreepManagerExtensions(extensionRegistry));
  }
}

const PKG_CreepManager_LogContext: LogContext = {
  logID: PKG_CreepManager,
  logLevel: LOG_INFO
}

class CreepManager extends BasicProcess<CreepManager_Memory> {
  @extensionInterface(EXT_CreepManager)
  Extensions!: ICreepManagerExtensions;

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
  protected get logID(): string {
    return PKG_CreepManager_LogContext.logID;
  }
  protected get logLevel(): LogLevel {
    return PKG_CreepManager_LogContext.logLevel!;
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
        if (!this.Extensions.tryRegisterCreep(creep.name)) {
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