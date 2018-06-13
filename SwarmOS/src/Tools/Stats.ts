/* USAGE:

1. Add a new declarations file like:

stats.d.ts
----

import { Statistics } from "./path/stats";

declare global {
    interface global {
        stats: Statistics;
        LastMemory: Memory;
        Memory: Memory;
    }

    interface RawMemory {
        _parsed: Memory;
    }

    interface CPU {
        getHeapStatistics(): any;
    }
}

----

2. Configure CONFIG below

3. At VERY top of main.js:
> import setup from "./path/stats";
> setup();

4. At top of loop():
> global.stats.reset();

5. At bottom of loop():
> global.stats.commit();

6. To add a stat, just call
> global.stats.addSimpleStat(key, value);
or more advanced
> global.stats.addStat('scheduler', { queue: 1 }, { count: 5, max: 5, min: 2, amount: 3 });

Tags (second argument) should not contain data that varies a lot, for example, don't
put stuff like object ids in tags doing so ends up causing massive performance hits
as the tag indexes get too large too quickly. Good data for tags is more static stuff
such as roomName, sectorName, etc, low overall spread.

*/
declare var Memory: {
    memory: StatsMemoryStructure
}
export function setup(): void {
    global['GStats'] = new Statistics();
}

export interface StatsConfig {
    driver: string;
    types: string[];
    key: string;
    segment: number;
    divider: string;
    baseStats: boolean;
}

interface Stat {
    name: string;
    tags: { [id: string]: any };
    values: { [id: string]: any };
}

const CONFIG: StatsConfig = {
    driver: 'Graphite', // Graphite, InfluxDB
    types: ['memory'], // memory, segment, console
    key: '__stats',
    segment: 30,
    divider: ';',  // "\n",
    baseStats: true,
}

export class Statistics implements IStatistics {
    constructor(opts = {}) {
        this.opts = Object.assign(CONFIG, opts);
        this.shard = (Game.shard && Game.shard.name) || 'shard2';
        //this.user = _.find(Game.spawns, v => v)!.owner.username;
        this.reset();
        this.startTick = Game.time;
    }

    get mem() {
        Memory[this.opts.key] = Memory[this.opts.key] || { index: 0, last: 0 };
        return Memory[this.opts.key];
    }

    private opts: StatsConfig;
    private stats!: Stat[];

    private startTick: number;

    private shard: string;
    private user: string = MY_USERNAME;
    private prefix!: string;

    private cpuReset!: number;


    public addSimpleStat(name: string, value: any = 0): void {
        this.addStat(name, {}, { value });
    }

    public addStat(name: string, tags: { [id: string]: any } = {}, values: { [id: string]: any } = {}): void {
        this.stats.push({ name, tags, values });
    }

    public reset(): void {
        if (Game.time === this.startTick) return; // Don't reset on new tick

        this.stats = [];
        this.cpuReset = Game.cpu.getUsed();
        this.addStat('memory', {}, {
            size: RawMemory.get().length
        });
    }

    public commit(): void {
        let start = Game.cpu.getUsed();

        if (this.opts.baseStats) this.addBaseStats();

        let formattedStats: string = `text/${this.opts.driver.toLowerCase()}\n`;

        let format = this[`format${this.opts.driver}`].bind(this); // Binds formatGraphite or formatInfluxDB to this object.
        _.each(this.stats, (v, k) => {
            formattedStats += format(v)
        });

        let end = Game.cpu.getUsed();

        formattedStats += format({ name: 'stats', tags: {}, values: { count: this.stats.length, size: formattedStats.length, cpu: end - start } })

        if (this.opts.types.indexOf('segment') >= 0) {
            RawMemory.segments[this.opts.segment] = formattedStats;
        }
        if (this.opts.types.indexOf('memory') >= 0) {
            Memory[this.opts.key] = formattedStats;
        }
        if (this.opts.types.indexOf('console') >= 0) {
            console.log('STATS' + this.opts.divider + formattedStats.replace(/\n/g, this.opts.divider));
        }
    }

    /** Adds some common stats. */
    private addBaseStats(): void {
        this.addStat('time', {}, {
            tick: Game.time,
            timestamp: Date.now(),
        });

        this.addStat('gcl', {}, {
            level: Game.gcl.level,
            progress: Game.gcl.progress,
            progressTotal: Game.gcl.progressTotal,
            progressPercent: (Game.gcl.progress / Game.gcl.progressTotal) * 100
        });

        this.addStat('market', {}, {
            credits: Game.market.credits
        });

        _.each(Game.rooms, room => {
            let { controller, storage, terminal } = room;
            if (!controller || !controller.my) return;

            this.addStat(
                'room',
                { room: room.name },
                {
                    level: controller.level,
                    progress: controller.progress,
                    progressTotal: controller.progressTotal,
                    progressPercent: (controller.progress / controller.progressTotal) * 100,
                    energyAvailable: room.energyAvailable,
                    energyCapacityAvailable: room.energyCapacityAvailable
                });

            if (controller)
                this.addStat(
                    'controller',
                    { room: room.name },
                    {
                        level: controller.level,
                        progress: controller.progress,
                        progressTotal: controller.progressTotal,
                        progressPercent: (controller.progress / controller.progressTotal) * 100
                    });

            if (storage)
                this.addStat(
                    'storage',
                    { room: room.name },
                    storage.store);

            if (terminal)
                this.addStat(
                    'terminal',
                    { room: room.name },
                    terminal.store);
        });

        if (typeof Game.cpu.getHeapStatistics === 'function')
            this.addStat('heap', {}, Game.cpu.getHeapStatistics())

        let used = Game.cpu.getUsed();

        this.addStat('cpu', {}, {
            bucket: Game.cpu.bucket,
            used: used,
            limit: Game.cpu.limit,
            start: this.cpuReset,
            percent: (used / Game.cpu.limit) * 100
        });
    }

    private formatInfluxDB(stat: Stat): string {
        let { name, tags, values } = stat;
        Object.assign(tags, { user: this.user, shard: this.shard });
        return `${name},${this.kv(tags)} ${this.kv(values)}\n`;
    }

    private formatGraphite(stat: Stat): string {
        let { name, tags, values } = stat;
        if (!this.prefix)
            this.prefix = `${this.user}`; // .${this.shard}`
        // most readable code every written:
        let pre = [this.prefix, this.kv(tags, '.').join('.'), name].filter(v => v).join('.');
        return this.kv(values, ' ').map(v => `${pre}.${v}\n`).join('');
    }

    private kv(obj: any, sep = '='): string[] {
        return _.map(obj, (v, k) => `${k}${sep}${v}`)
    }
}