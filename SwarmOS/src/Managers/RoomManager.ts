declare var Memory: {
  roomData: RoomStateMemory
}

import { ExtensionBase, BasicProcess } from "Core/BasicTypes";

export const OSPackage: IPackage = {
  install(processRegistry: IProcessRegistry, extensionRegistry: IExtensionRegistry) {
    processRegistry.register(PKG_RoomManager, RoomManager);
    extensionRegistry.register(EXT_RoomManager, new RoomManagerExtension(extensionRegistry));
  }
}

const PKG_RoomManager_LogContext: LogContext = {
  logID: PKG_RoomManager,
  logLevel: LOG_INFO
}

class RoomManager extends BasicProcess<RoomStateMemory> {
  @extensionInterface(EXT_RoomManager)
  roomManager!: IRoomManagerExtension;

  get memory(): RoomStateMemory {
    if (!Memory.roomData) {
      this.log.warn(`Initializing RoomManager memory`);
      Memory.roomData = {
        roomStateData: {},
      }
    }
    return Memory.roomData;
  }
  protected get logID(): string {
    return PKG_RoomManager_LogContext.logID;
  }
  protected get logLevel(): LogLevel {
    return PKG_RoomManager_LogContext.logLevel;
  }

  RunThread(): ThreadState {
    for (let roomID in Game.rooms) {
      let data = this.roomManager.GetRoomData(roomID);
      if (!data) {
        continue;
      }

      if (Game.time - data.lastUpdated > 23) {
        this.roomManager.ScanRoom(roomID);
      }

      if (!data.activityPIDs[RPKG_Towers] || !this.kernel.getProcessByPID(data.activityPIDs[RPKG_Towers])) {
        data.activityPIDs[RPKG_Towers] = this.kernel.startProcess(RPKG_Towers, {
          roomID: roomID
        } as TowerMemory);
        this.kernel.setParent(data.activityPIDs[RPKG_Towers], this.pid);
      }

      if (!data.activityPIDs.RPKG_EnergyManager || !this.kernel.getProcessByPID(data.activityPIDs.RPKG_EnergyManager)) {
        data.activityPIDs.RPKG_EnergyManager = this.kernel.startProcess(RPKG_EnergyManager, {
          harvesterPIDs: {},
          refillerPID: '',
          workerPIDs: [],
          mineralHarvesterPID: '',
          roomID: roomID
        } as EnergyManagerMemory);
        this.kernel.setParent(data.activityPIDs.RPKG_EnergyManager, this.pid);
      }
    }

    return ThreadState_Done;
  }
}

class RoomManagerExtension extends ExtensionBase implements IRoomManagerExtension {
  get memory(): RoomStateMemory {
    if (!Memory.roomData) {
      this.log.warn(`Initializing RoomManager memory`);
      Memory.roomData = {
        roomStateData: {}
      }
    }

    return Memory.roomData;
  }
  protected get logID(): string {
    return PKG_RoomManager_LogContext.logID;
  }
  protected get logLevel(): LogLevel {
    return PKG_RoomManager_LogContext.logLevel;
  }

  GetRoomData(roomID: string): RoomState {
    let roomState = this.memory.roomStateData[roomID];
    if (!roomState) {
      let room = Game.rooms[roomID];
      if (room) {
        this.memory.roomStateData[roomID] = {
          lastUpdated: 0,
          activityPIDs: {
            RPKG_EnergyManager: '',
            RPKG_Towers: ''
          },
          mineralIDs: room.find(FIND_MINERALS)!.map((val: Mineral) => {
            return val.id;
          }),
          sourceIDs: room.find(FIND_SOURCES)!.map((val: Source) => {
            return val.id;
          }),
          cSites: [],
          needsRepair: [],
          structures: {
            container: [],
            controller: [],
            extension: [],
            extractor: [],
            spawn: [],
            storage: [],
            terminal: [],
            tower: []
          },
          resources: [],
          tombstones: [],
          ruins: []
        }
      }
    }

    return roomState;
  }

  ScanRoom(roomID: string) {
    let roomState = this.GetRoomData(roomID);
    if (!roomState || !Game.rooms[roomID]) {
      return;
    }

    roomState.cSites = [];
    let cSites = Game.rooms[roomID].find(FIND_CONSTRUCTION_SITES);
    for (let i = 0; i < cSites.length; i++) {
      roomState.cSites.push(cSites[i].id);
    }

    roomState.needsRepair = [];
    let structures = Game.rooms[roomID].find(FIND_STRUCTURES);

    roomState.structures = {
      container: [],
      controller: [],
      extension: [],
      extractor: [],
      spawn: [],
      storage: [],
      terminal: [],
      tower: []
    }

    let structureTypeIDs = Object.keys(roomState.structures);
    for (let i = 0; i < structures.length; i++) {
      if (structures[i].hits < structures[i].hitsMax * 0.75) {
        roomState.needsRepair.push(structures[i].id);
      }

      for (let j = 0; j < structureTypeIDs.length; j++) {
        if (structures[i].structureType == structureTypeIDs[j]) {
          roomState.structures[structureTypeIDs[j]]!.push(structures[i].id);
        }
      }
    }

    roomState.resources = [];
    let resources = Game.rooms[roomID].find(FIND_DROPPED_RESOURCES);
    for (let i = 0; i < resources.length; i++) {
      roomState.resources.push(resources[i].id);
    }

    roomState.tombstones = [];
    let tombstones = Game.rooms[roomID].find(FIND_TOMBSTONES);
    for (let i = 0; i < tombstones.length; i++) {
      roomState.tombstones.push(tombstones[i].id);
    }

    roomState.ruins = [];
    let ruins = Game.rooms[roomID].find(FIND_RUINS);
    for (let i = 0; i < ruins.length; i++) {
      roomState.ruins.push(ruins[i].id);
    }

    roomState.lastUpdated = Game.time;
  }
}