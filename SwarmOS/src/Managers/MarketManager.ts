declare var Memory: {
  marketMemory: MarketManager_Memory
}
import { BasicProcess } from "Core/BasicTypes";

export const OSPackage: IPackage = {
  install(processRegistry: IProcessRegistry, extensionRegistry: IExtensionRegistry) {
    processRegistry.register(PKG_MarketManager, MarketManager);
  }
}
const PKG_MarketManager_LogContext: LogContext = {
  logID: PKG_FlagManager,
  logLevel: LOG_INFO
}

class MarketManager extends BasicProcess<MarketManager_Memory> {
  @extensionInterface(EXT_RoomManager)
  roomManager!: IRoomManagerExtension;

  get memory(): MarketManager_Memory {
    if (!Memory.marketMemory) {
      this.log.warn(`Initializing MarketManager memory`);
      Memory.marketMemory = {
        terminals: {},
        lastUpdate: 0
      }
    }
    return Memory.marketMemory;
  }
  protected get logID() {
    return PKG_MarketManager_LogContext.logID;
  }
  protected get logLevel(): LogLevel {
    return PKG_MarketManager_LogContext.logLevel!;
  }

  private MARKET_MANAGER_ENABLED = false;
  RunThread(): ThreadState {
    if (!this.MARKET_MANAGER_ENABLED) return ThreadState_Done;
    if (Game.rooms['sim'] || Game.cpu.getUsed() > (Game.cpu.limit * 0.75)) return ThreadState_Done;
    if (Game.time - this.memory.lastUpdate > 1000) {
      let roomIDs = Object.keys(Game.rooms);
      for (let i = 0; i < roomIDs.length; i++) {
        let room = Game.rooms[roomIDs[i]];
        if (room.terminal && !this.memory.terminals[room.terminal.id]) {
          this.memory.terminals[room.terminal.id] = "";
        }
      }

      this.memory.lastUpdate = Game.time;
    }

    let canTransfer = false;
    let terminalIDs = Object.keys(this.memory.terminals);
    for (let i = 0; i < terminalIDs.length; i++) {
      let terminal = Game.getObjectById<StructureTerminal>(this.memory.terminals[terminalIDs[i]]);
      if (!terminal) {
        delete this.memory.terminals[terminalIDs[i--]];
        continue;
      }
      if (terminal && !((terminal.cooldown | 0) > 0)) {
        if (this.memory.terminals[terminalIDs[i]]) {
          let order = Game.market.getOrderById(this.memory.terminals[terminalIDs[i]]);
          if (order) {
            Game.market.deal(order.id, order.amount, terminal.room.name);
            this.memory.terminals[terminalIDs[i]] = '';
            return ThreadState_Done;
          } else {
            canTransfer = true;
          }
        } else {
          canTransfer = true;
        }
      }
    }

    if (!canTransfer) return ThreadState_Done;

    let allOrders = Game.market.getAllOrders({
      resourceType: RESOURCE_ENERGY
    });
    let sellOrders = [];
    let buyOrders = [];
    for (let i = 0; i < allOrders.length; i++) {
      if (allOrders[i].type == ORDER_SELL) {
        sellOrders.push(allOrders[i]);
      } else {
        buyOrders.push(allOrders[i]);
      }
    }

    let sortedSellOrders: SortedOrders = {};
    for (let i = 0; i < sellOrders.length; i++) {
      sortedSellOrders[sellOrders[i].resourceType].push(sellOrders[i]);
    }
    let sellTypes = Object.keys(sortedSellOrders);
    for (let i = 0; i < sellTypes.length; i++) {
      sortedSellOrders[sellTypes[i]].sort((a: Order, b: Order) => {
        if (a.price < b.price) {
          return -1;
        } else if (a.price > b.price) {
          return 1;
        }
        return 0;
      });
    }

    let sortedBuyOrders: SortedOrders = {};
    for (let i = 0; i < buyOrders.length; i++) {
      sortedBuyOrders[buyOrders[i].resourceType].push(buyOrders[i]);
    }
    let buyTypes = Object.keys(sortedSellOrders);
    for (let i = 0; i < buyTypes.length; i++) {
      sortedBuyOrders[buyTypes[i]].sort((a: Order, b: Order) => {
        if (a.price < b.price) {
          return 1;
        } else if (a.price > b.price) {
          return -1;
        }
        return 0;
      });
    }

    for (let i = 0; i < sellTypes.length; i++) {
      if (!sortedBuyOrders[sellTypes[i]]) continue;
      let cheapestSeller = sortedSellOrders[sellTypes[i]][0];
      let biggestBuyer = sortedBuyOrders[sellTypes[i]][0];
      if (cheapestSeller.price < biggestBuyer.price * 0.9) {
        let amountToBuy = Math.min(cheapestSeller.amount, biggestBuyer.amount);
        let leastCost = 100000000;
        let bestTerminal = undefined;
        for (let j = 0; j < terminalIDs.length; j++) {
          let terminal = Game.getObjectById<StructureTerminal>(terminalIDs[j])!;
          let totalCost = Game.market.calcTransactionCost(amountToBuy, terminal.room.name, cheapestSeller.roomName!);
          totalCost += Game.market.calcTransactionCost(amountToBuy, terminal.room.name, biggestBuyer.roomName!);
          if (leastCost > totalCost) {
            leastCost = totalCost;
            bestTerminal = terminal;
          }
        }

        if (bestTerminal) {
          // Check that the cost of the energy is less than what I could make just selling the energy.
        }
      }
    }

    return ThreadState_Done;
  }
}

declare interface SortedOrders {
  [id: string]: Order[];
};