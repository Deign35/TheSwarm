/* USAGE:
To add a stat, just call
> global.stats.addSimpleStat(key, value);
or more advanced
> global.stats.addStat('scheduler', { queue: 1 }, { count: 5, max: 5, min: 2, amount: 3 });

*/
export function setup(): void {
    global['GStats'] = new Statistics();
}

interface Stat {
    name: string;
    values: { [id: string]: any };
}

export class Statistics implements IStatistics {
    constructor(opts = {}) {
        this.shard = (Game.shard && Game.shard.name) || 'shard2';
        this.reset();
        this.startTick = Game.time;
    }

    private stats!: IDictionary<string, IDictionary<string, Stat>>;

    private startTick: number;

    private shard: string;
    private prefix!: string;

    private cpuReset!: number;

    public addSimpleStat(path: string, name: string, value: any = 0): void {
        this.addStat(path, { [name]: value });
    }

    public addStat(name: string, values: { [id: string]: any } = {}): void {
        if (!this.stats[name]) {
            this.stats[name] = {}; // (TODO): Maybe convert this to files?
        }
        let keys = Object.keys(values);
        for (let i = 0; i < keys.length; i++) {
            this.stats[name][keys[i]] = values[keys[i]];
        }
    }

    public reset(): void {
        if (Game.time === this.startTick) return; // Don't reset on new tick

        this.stats = {}
        this.cpuReset = Game.cpu.getUsed();
        this.addStat('memory', {
            size: RawMemory.get().length
        });
    }

    public commit(): void {
        this.addBaseStats();
        if (C_STATS_SAVETO_MEMORY) {
            MasterFS.EnsurePath('/Stats');
            MasterFS.SaveFile('/Stats', 'stats', this.stats);
        }

        if (C_STATS_SAVETO_SEGMENT) {
            RawMemory.segments[SEG_Stats] = JSON.stringify(this.stats);
        }
    }

    /** Adds some common stats. */
    private addBaseStats(): void {
        this.addStat('time', {
            tick: Game.time,
            timestamp: Date.now(),
        });

        this.addStat('gcl', {
            level: Game.gcl.level,
            progress: Game.gcl.progress,
            progressTotal: Game.gcl.progressTotal,
            progressPercent: (Game.gcl.progress / Game.gcl.progressTotal) * 100
        });

        this.addStat('market', {
            credits: Game.market.credits
        });

        _.each(Game.rooms, room => {
            let { controller, storage, terminal } = room;
            if (!controller || !controller.my) return;

            let roomFolderPath = `room/${room.name}`
            this.addStat(
                roomFolderPath,
                {
                    level: controller.level,
                    progress: controller.progress,
                    progressTotal: controller.progressTotal,
                    progressPercent: (controller.progress / controller.progressTotal) * 100,
                    energyAvailable: room.energyAvailable,
                    energyCapacityAvailable: room.energyCapacityAvailable
                });

            if (storage)
                this.addStat(
                    'storage',
                    storage.store);

            if (terminal)
                this.addStat(
                    'terminal',
                    terminal.store);
        });

        if (typeof Game.cpu.getHeapStatistics === 'function')
            this.addStat('heap', Game.cpu.getHeapStatistics())

        let used = Game.cpu.getUsed();

        this.addStat('cpu', {
            bucket: Game.cpu.bucket,
            used: used,
            limit: Game.cpu.limit,
            start: this.cpuReset,
            percent: (used / Game.cpu.limit) * 100
        });
    }
}