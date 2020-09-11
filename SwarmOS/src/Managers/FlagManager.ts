declare var Memory: {
  flagData: FlagManagerMemory
}
import { BasicProcess } from "Core/BasicTypes";

export const OSPackage: IPackage = {
  install(processRegistry: IProcessRegistry, extensionRegistry: IExtensionRegistry) {
    processRegistry.register(PKG_FlagManager, FlagManager);
  }
}

const PKG_FlagManager_LogContext: LogContext = {
  logID: PKG_FlagManager,
  logLevel: LOG_INFO
}

/**
 * BLUE_ -- Basic constructionSites
 *      BLUE_ -- StructureExtension
 *      BROWN_ -- StructureContainer
 *      CYAN_ -- StructreLab
 *      GREEN_ -- StructureLink
 *      GREY_ -- StructureRampart
 *      ORANGE_ -- StructureRoad
 *      PURPLE_ -- StructureTower
 *      RED_ -- StructureWall
 *      WHITE_ --
 *      YELLOW_ --
 *
 * BROWN_ -- Advanced constructionSites
 *      BLUE_ -- StructureExtractor
 *      BROWN_ -- StructureSpawn
 *      CYAN_ -- StructreObserver
 *      GREEN_ -- StructurePowerSpawn
 *      GREY_ -- StructureNuker
 *      ORANGE_ -- StructureStorage
 *      PURPLE_ -- StructureTerminal
 *      RED_ -- StructureFactory
 *      WHITE_ --
 *      YELLOW_ --
 *
 * CYAN_ --
 * GREEN_ --
 * GREY_ --
 * ORANGE_ --
 * PURPLE_ --
 * RED_ --
 * WHITE_ --
 * YELLOW_ --
 */

class FlagManager extends BasicProcess<FlagManagerMemory, MemCache> {
  get memory(): FlagManagerMemory {
    if (!Memory.flagData) {
      this.log.warn(`Initializing FlagManager memory`);
      Memory.flagData = {}
    }
    return Memory.flagData;
  }
  protected get logID() {
    return PKG_FlagManager_LogContext.logID;
  }
  protected get logLevel(): LogLevel {
    return PKG_FlagManager_LogContext.logLevel!;
  }

  RunThread(): ThreadState {
    for (let id in Game.flags) {
      let flag = Game.flags[id];

      switch (flag.color) {
        case (COLOR_BLUE):
          this.createBasicSite(flag);
          break;
        case (COLOR_BROWN):
          this.createAdvancedSite(flag);
          break;
        case (COLOR_CYAN):
        case (COLOR_GREEN):
        case (COLOR_GREY):
        case (COLOR_ORANGE):
        case (COLOR_PURPLE):
        case (COLOR_RED):
        case (COLOR_WHITE):
        case (COLOR_YELLOW):
        default:
          break;
      }
    }

    this.sleeper.sleep(this.pid, 30);

    return ThreadState_Done;
  }

  protected createBasicSite(flag: Flag) {
    if (!flag.room) {
      return;
    }
    let csCreated = ERR_INVALID_ARGS as ScreepsReturnCode;
    switch (flag.secondaryColor) {
      case (COLOR_BLUE):
        csCreated = flag.room.createConstructionSite(flag.pos, STRUCTURE_EXTENSION);
        break;
      case (COLOR_BROWN):
        csCreated = flag.room.createConstructionSite(flag.pos, STRUCTURE_CONTAINER);
        break;
      case (COLOR_CYAN):
        csCreated = flag.room.createConstructionSite(flag.pos, STRUCTURE_LAB);
        break;
      case (COLOR_GREEN):
        csCreated = flag.room.createConstructionSite(flag.pos, STRUCTURE_LINK);
        break;
      case (COLOR_GREY):
        csCreated = flag.room.createConstructionSite(flag.pos, STRUCTURE_RAMPART);
        break;
      case (COLOR_ORANGE):
        csCreated = flag.room.createConstructionSite(flag.pos, STRUCTURE_ROAD);
        break;
      case (COLOR_PURPLE):
        csCreated = flag.room.createConstructionSite(flag.pos, STRUCTURE_TOWER);
        break;
      case (COLOR_RED):
        csCreated = flag.room.createConstructionSite(flag.pos, STRUCTURE_WALL);
        break;
      case (COLOR_WHITE):
      case (COLOR_YELLOW):
      default:
        break;
    }

    if (csCreated == OK) {
      flag.remove();
    }
  }
  protected createAdvancedSite(flag: Flag) {
    if (!flag.room) {
      return;
    }
    let csCreated = ERR_INVALID_ARGS as ScreepsReturnCode;
    switch (flag.secondaryColor) {
      case (COLOR_BLUE):
        csCreated = flag.room.createConstructionSite(flag.pos, STRUCTURE_EXTRACTOR);
        break;
      case (COLOR_BROWN):
        csCreated = flag.room.createConstructionSite(flag.pos, STRUCTURE_SPAWN);
        break;
      case (COLOR_CYAN):
        csCreated = flag.room.createConstructionSite(flag.pos, STRUCTURE_OBSERVER);
        break;
      case (COLOR_GREEN):
        csCreated = flag.room.createConstructionSite(flag.pos, STRUCTURE_POWER_SPAWN);
        break;
      case (COLOR_GREY):
        csCreated = flag.room.createConstructionSite(flag.pos, STRUCTURE_NUKER);
        break;
      case (COLOR_ORANGE):
        csCreated = flag.room.createConstructionSite(flag.pos, STRUCTURE_STORAGE);
        break;
      case (COLOR_PURPLE):
        csCreated = flag.room.createConstructionSite(flag.pos, STRUCTURE_TERMINAL);
        break;
      case (COLOR_RED):
        csCreated = flag.room.createConstructionSite(flag.pos, STRUCTURE_FACTORY);
        break;
      case (COLOR_WHITE):
      case (COLOR_YELLOW):
      default:
        break;
    }

    if (csCreated == OK) {
      flag.remove();
    }
  }
}