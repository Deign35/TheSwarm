declare var Memory: {
  terminalNetwork: TerminalNetwork_Memory
}

import { BasicProcess, ExtensionBase } from "Core/BasicTypes";

export const OSPackage: IPackage = {
  install(processRegistry: IProcessRegistry, extensionRegistry: IExtensionRegistry) {
    processRegistry.register(PKG_TerminalNetwork, TerminalNetwork);
    extensionRegistry.register(EXT_TerminalNetwork, new TerminalNetworkExtensions(extensionRegistry));
  }
}
const PKG_TerminalNetwork_LogContext: LogContext = {
  logID: PKG_TerminalNetwork,
  logLevel: LOG_INFO
}

class TerminalNetwork extends BasicProcess<TerminalNetwork_Memory, TerminalNetwork_Cache> {
  @extensionInterface(EXT_RoomManager)
  roomManager!: IRoomManagerExtension;
  get memory(): TerminalNetwork_Memory {
    if (!Memory.terminalNetwork) {
      this.log.warn(`Initializing TerminalNetwork memory`);
      Memory.terminalNetwork = {
        requests: []
      }
    }
    return Memory.terminalNetwork;
  }
  protected get logID() {
    return PKG_TerminalNetwork_LogContext.logID;
  }
  protected get logLevel(): LogLevel {
    return PKG_TerminalNetwork_LogContext.logLevel!;
  }

  RunThread(): ThreadState {
    if (!this.cache.roomsWithTerminal) { this.cache.roomsWithTerminal = []; }
    if (!this.cache.roomsWithStorage) { this.cache.roomsWithStorage = []; }

    if (Game.time % 113 || this.cache.roomsWithTerminal.length == 0) {
      this.cache.roomsWithTerminal = [];
      this.cache.roomsWithStorage = [];
      for (const roomID in Game.rooms) {
        const room = Game.rooms[roomID];
        if (room.terminal && room.terminal.my) {
          this.cache.roomsWithTerminal.push(roomID);

          if (room.storage) {
            this.cache.roomsWithStorage.push(roomID);
          }
        }
      }
    }

    const usedTerminals: string[] = [];
    for (let i = 0; i < this.memory.requests.length; i++) {
      const request = this.memory.requests[i];
      let requestFulfilled = false;
      for (let j = 0; j < this.cache.roomsWithTerminal.length; j++) {
        const room = Game.rooms[this.cache.roomsWithTerminal[j]];
        if (room.name == request.roomID || !room.terminal || usedTerminals.includes(room.name)) { continue; }
        if (room.terminal.store.getUsedCapacity(request.resourceType) >= request.amount) {
          requestFulfilled = true; // Marking as fulfilled because we might just be on cooldown
          if (room.terminal.send(request.resourceType, request.amount, request.roomID) == OK) {
            usedTerminals.push(room.name);
            this.memory.requests.splice(i--, 1);
            break;
          }
        }
      }

      if (requestFulfilled || request.transferingFromStorage) { continue; }

      // Did not find the requested resource in any terminals, check storages
      for (let j = 0; j < this.cache.roomsWithStorage.length; j++) {
        const room = Game.rooms[this.cache.roomsWithStorage[j]];
        if (!room.storage) { continue; }
        if (room.storage.store.getUsedCapacity(request.resourceType) >= request.amount) {
          const roomData = this.roomManager.GetRoomData(room.name)!;
          roomData.terminalRequests.push({ amount: request.amount, resourceType: request.resourceType });
          request.transferingFromStorage = true;
          break;
        }
      }
    }

    return ThreadState_Done;
  }
}

class TerminalNetworkExtensions extends ExtensionBase implements ITerminalNetworkExtensions {
  get memory(): TerminalNetwork_Memory {
    if (!Memory.terminalNetwork) {
      this.log.warn(`Initializing CreepManager memory`);
      Memory.terminalNetwork = {
        requests: []
      }
    }

    return Memory.terminalNetwork;
  }
  protected get logID() {
    return PKG_TerminalNetwork_LogContext.logID;
  }
  protected get logLevel(): LogLevel {
    return PKG_TerminalNetwork_LogContext.logLevel!;
  }

  RequestResources(request: TerminalNetworkRequest): void {
    this.memory.requests.push(request);
  }

  HasResourceInNetwork(resourceType: ResourceConstant, amount: number): boolean {
    for (const roomID in Game.rooms) {
      const room = Game.rooms[roomID];
      if (room.terminal && room.terminal.my) {
        if (room.terminal.store.getUsedCapacity(resourceType) >= amount) {
          return true;
        }
      }

      if (room.storage && room.storage.my) {
        if (room.storage.store.getUsedCapacity(resourceType) >= amount) {
          return true;
        }
      }
    }
    return false;
  }
}