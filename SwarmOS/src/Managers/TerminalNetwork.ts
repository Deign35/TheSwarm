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

    if (Game.time % 113 || this.cache.roomsWithTerminal.length == 0) {
      this.cache.roomsWithTerminal = [];
      for (const roomID in Game.rooms) {
        const room = Game.rooms[roomID];
        if (room.terminal) {
          this.cache.roomsWithTerminal.push(roomID);
        }
      }
    }

    for (let i = 0; i < this.memory.requests.length; i++) {
      const request = this.memory.requests[i];
      for (let j = 0; j < this.cache.roomsWithTerminal.length; j++) {
        const room = Game.rooms[this.cache.roomsWithTerminal[j]];
        if (room.name == request.roomID || !room.terminal) { continue; }
        if (room.terminal.store.getUsedCapacity(request.resourceType) >= request.amount) {
          if (room.terminal.send(request.resourceType, request.amount, request.roomID) == OK) {
            this.memory.requests.splice(i--, 1);
            break;
          }
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
}