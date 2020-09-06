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
  logID: PKG_MarketManager,
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
        lastUpdate: 0,
        isEnabled: false
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

  RunThread(): ThreadState {
    return ThreadState_Done;
  }

  EndTick() {
    try {
      if (!this.memory.isEnabled) return;
      this.memory.isEnabled = false;
      if (Game.rooms['sim'] || Game.cpu.getUsed() > (Game.cpu.limit * 0.75)) return;
      if (Game.time - this.memory.lastUpdate > 1000) {
        const roomIDs = Object.keys(Game.rooms);
        for (let i = 0; i < roomIDs.length; i++) {
          const room = Game.rooms[roomIDs[i]];
          if (room.terminal && room.terminal.my && !this.memory.terminals[room.terminal.id]) {
            this.memory.terminals[room.terminal.id] = "";
          }
        }

        this.memory.lastUpdate = Game.time;
      }

      let canTransfer = false;
      const terminalIDs = Object.keys(this.memory.terminals);
      for (let i = 0; i < terminalIDs.length; i++) {
        const terminal = Game.getObjectById<StructureTerminal>(this.memory.terminals[terminalIDs[i]]);
        if (!terminal) {
          delete this.memory.terminals[terminalIDs[i--]];
          continue;
        }
        if (terminal && (terminal.cooldown | 0) <= 0) {
          canTransfer = true;
          if (this.memory.terminals[terminalIDs[i]]) {
            const order = Game.market.getOrderById(this.memory.terminals[terminalIDs[i]]);
            this.memory.terminals[terminalIDs[i]] = '';
            if (order) {
              Game.market.deal(order.id, order.amount, terminal.room.name);
              return;
            }
          }
        }
      }

      if (!canTransfer) return;

      const allOrders = Game.market.getAllOrders({
        resourceType: RESOURCE_HYDROGEN
      });
      const sellOrders = [];
      const buyOrders = [];
      for (let i = 0; i < allOrders.length; i++) {
        if (allOrders[i].type == ORDER_SELL) {
          sellOrders.push(allOrders[i]);
        } else {
          buyOrders.push(allOrders[i]);
        }
      }

      sellOrders.sort((a: Order, b: Order) => {
        if (a.price < b.price) {
          return -1;
        } else if (a.price > b.price) {
          return 1;
        }
        return 0;
      });
      buyOrders.sort((a: Order, b: Order) => {
        if (a.price < b.price) {
          return 1;
        } else if (a.price > b.price) {
          return -1;
        }
        return 0;
      });

      const cheapestSeller = sellOrders[0];
      const biggestBuyer = buyOrders[0];
      this.log.info(`cheapest seller: ${cheapestSeller.price} / ${cheapestSeller.amount}\nbiggest buyer: ${biggestBuyer.price} / ${biggestBuyer.amount}`);
      if (cheapestSeller.price < biggestBuyer.price * 0.9) {
        let amountToBuy = Math.min(cheapestSeller.amount, biggestBuyer.amount);
        let leastCost = 100000000;
        let bestTerminal = undefined;
        for (let i = 0; i < terminalIDs.length; i++) {
          if (this.memory.terminals[terminalIDs[i]]) { continue; }
          const terminal = Game.getObjectById<StructureTerminal>(terminalIDs[i])!;
          let totalCost = Game.market.calcTransactionCost(amountToBuy, terminal.room.name, cheapestSeller.roomName!);
          totalCost += Game.market.calcTransactionCost(amountToBuy, terminal.room.name, biggestBuyer.roomName!);
          if (leastCost > totalCost) {
            leastCost = totalCost;
            bestTerminal = terminal;
          }
        }

        if (bestTerminal) {
          this.log.info(`lowest energy cost: ${leastCost}`);
          // Check that the cost of the energy is less than what I could make just selling the energy.
          const energyOrders = Game.market.getAllOrders({
            resourceType: RESOURCE_ENERGY
          });
          energyOrders.sort((a: Order, b: Order) => {
            if (a.price < b.price) {
              return -1;
            } else if (a.price > b.price) {
              return 1;
            }
            return 0;
          });

          this.log.info(`energy price: ${energyOrders[5].price}`);
          if ((cheapestSeller.price * amountToBuy) + (energyOrders[5].price * leastCost) < (biggestBuyer.price * amountToBuy)) {
            // Its a winner!
            //this.memory.terminals[bestTerminal.id] = biggestBuyer.id;
            //Game.market.deal(cheapestSeller.id, amountToBuy, bestTerminal.room.name);

            this.log.info(`Found a money maker!\ncheapestSeller: ${cheapestSeller.price}\nbiggestBuyer: ${biggestBuyer.price}\nenergyCost: ${leastCost}`)
          }
        }
      }
    } catch (e) {
      this.log.error(`Error caught while trying to use MarketManager\n${e}`);
    }
  }
}