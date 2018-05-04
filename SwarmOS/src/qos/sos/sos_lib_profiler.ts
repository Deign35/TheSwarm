/**
 * Initial commit was copied from 
 * https://github.com/ScreepsQuorum/screeps-quorum/tree/7254e727868fdc30e93b4e4dc8e015021d08a6ef
 * 
 */
export class sos_lib_profiler {
    __index: number = 0;
    __running = {};

    start(name: string, category: string = 'adhoc', tags: string[]) {
        this.__index++;
        var token = this.__index;
        this.__running[token] = {
            name: name,
            tags: tags,
            category: category,
            start: Game.cpu.getUsed()
        }

        return token;
    }
    end(token: string) {
        let finished = Game.cpu.getUsed();
        if (!this.__running[token]) {
            console.log('Profiler: no data found');//, LOG_ERROR);
            return false;
        }
        let meta = this.__running[token];
        let cpu = finished - meta['start'];
        if (!!Stats && !!Memory.sos.storeProfileStats) {
            let index = 'sosprofiler.p' + token;
            let send = meta.tags;
            send.block = meta.name;
            send.cpu = cpu;
            Stats.addStat(index, send, true);
        }
        console.log("Profiler\t" + meta.name + "\t" + cpu.toPrecision(4) + " cpu", { 'profiler': true, block: meta.name })
        delete this.__running[token]
        return true
    }
}