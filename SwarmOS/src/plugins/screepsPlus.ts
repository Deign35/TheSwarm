import { RoomResources } from './screepsPlus/RoomResources';
import { Delegate } from '../common/Delegate';

declare interface ScreepsPlusDelegate {
	(stats: any): void;
}

export class ScreepsPlus {
	private _spDelegate = new Delegate();
	AddStatsCallback(id: string, callback: ScreepsPlusDelegate) {
		this._spDelegate.Subscribe(id, callback);
	}
	CollectStats() {
		if (Memory.stats == null) {
			Memory.stats = { tick: Game.time };
		}

		// Note: This is fragile and will change if the Game.cpu API changes
		Memory.stats.cpu = Game.cpu;
		// Memory.stats.cpu.used = Game.cpu.getUsed(); // AT END OF MAIN LOOP

		// Note: This is fragile and will change if the Game.gcl API changes
		Memory.stats.gcl = Game.gcl;

		const memory_used = RawMemory.get().length;
		// console.log('Memory used: ' + memory_used);
		Memory.stats.memory = {
			used: memory_used,
			// Other memory stats here?
		};

		Memory.stats.market = {
			credits: Game.market.credits,
			num_orders: Game.market.orders ? Object.keys(Game.market.orders).length : 0,
		};

		Memory.stats.roomSummary = [];
		for (let roomId in Game.rooms) {
			Memory.stats.roomSummary.push(new RoomResources(Game.rooms[roomId]));
		}

		// Add callback functions which we can call to add additional
		// statistics to here, and have a way to register them.
		// 1. Merge in the current repair ratchets into the room summary
		// TODO: Merge in the current creep desired numbers into the room summary
		this._spDelegate.Notify(Memory.stats);
	}
}