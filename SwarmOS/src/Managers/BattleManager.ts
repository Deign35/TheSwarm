declare var Memory: {
  battleData: BattleManagerMemory
}
declare var MemoryCache: {
  battleData: BattleManagerCache;
}

import { BasicProcess, ExtensionBase } from "Core/BasicTypes";

export const OSPackage: IPackage = {
  install(processRegistry: IProcessRegistry, extensionRegistry: IExtensionRegistry) {
    processRegistry.register(PKG_BattleManager, BattleManager);
    extensionRegistry.register(EXT_BattleManager, BattleManagerExtensions);
  }
}

const PKG_BattleManager_LogContext: LogContext = {
  logID: PKG_BattleManager,
  logLevel: LOG_INFO
}

class BattleManager extends BasicProcess<BattleManagerMemory, BattleManagerCache> {
  get memory(): BattleManagerMemory {
    if (!Memory.battleData) {
      this.log.warn(`Initializing BattleManager memory`);
      Memory.battleData = {}
    }
    return Memory.battleData;
  }
  get cache(): BattleManagerCache {
    if (!MemoryCache.battleData) {
      MemoryCache.battleData = {
        rooms: {}
      };
    }
    return MemoryCache.battleData;
  }
  protected get logID() {
    return PKG_BattleManager_LogContext.logID;
  }
  protected get logLevel(): LogLevel {
    return PKG_BattleManager_LogContext.logLevel!;
  }

  PrepTick() {
    if (!this.cache.rooms) {
      this.cache.rooms = {};
    }
    for (const roomID in Game.rooms) {
      if (!this.cache.rooms[roomID] || this.cache.rooms[roomID].lastUpdated <= (Game.time + 13) ||
        this.cache.rooms[roomID].creepContainer.GetNumHostiles() > 0) {
        this.cache.rooms[roomID] = {
          lastUpdated: Game.time,
          creepContainer: new HostileCreepContainer(Game.rooms[roomID])
        };
      }
    }
  }

  RunThread(): ThreadState {
    return ThreadState_Done;
  }
}

class BattleManagerExtensions extends ExtensionBase implements IBattleManagerExtensions {
  get memory(): BattleManagerMemory {
    if (!Memory.battleData) {
      this.log.warn(`Initializing BattleManager memory`);
      Memory.battleData = {}
    }
    return Memory.battleData;
  }
  get cache(): BattleManagerCache {
    if (!MemoryCache.battleData) {
      MemoryCache.battleData = {
        rooms: {}
      };
    }
    return MemoryCache.battleData;
  }
  protected get logID() {
    return PKG_BattleManager_LogContext.logID;
  }
  protected get logLevel(): LogLevel {
    return PKG_BattleManager_LogContext.logLevel!;
  }

  GetHostileCreepContainer(roomID: string): IHostileCreepContainer | undefined {
    return this.cache.rooms[roomID] && this.cache.rooms[roomID].creepContainer;
  }
}

class HostileCreepContainer implements IHostileCreepContainer {
  constructor(room: Room) {
    const hostiles = room.find(FIND_HOSTILE_CREEPS);
    this.attackCreeps = [];
    this.healCreeps = [];
    this.otherCreeps = [];

    for (let i = 0; i < hostiles.length; i++) {
      const hostile = hostiles[i];
      if (hostile.getActiveBodyparts(HEAL)) {
        this.healCreeps.push(hostile);
        if (hostile.getActiveBodyparts(ATTACK) || hostile.getActiveBodyparts(RANGED_ATTACK)) {
          this.attackCreeps.push(hostile);
        }
      } else if (hostile.getActiveBodyparts(ATTACK) || hostile.getActiveBodyparts(RANGED_ATTACK)) {
        this.attackCreeps.push(hostile);
      } else {
        this.otherCreeps.push(hostile);
      }
    }
  }

  private attackCreeps: Creep[];
  private healCreeps: Creep[];
  private otherCreeps: Creep[];
  GetNumHostiles(): number {
    return this.attackCreeps.length + this.healCreeps.length + this.otherCreeps.length;
  }
  GetAttackCreeps(): Creep[] {
    return this.attackCreeps;
  }
  GetHealCreeps(): Creep[] {
    return this.healCreeps;
  }
  GetNonBattleCreeps(): Creep[] {
    return this.otherCreeps;
  }
}