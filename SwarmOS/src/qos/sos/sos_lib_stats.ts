/**
 * Initial commit was copied from 
 * https://github.com/ScreepsQuorum/screeps-quorum/tree/7254e727868fdc30e93b4e4dc8e015021d08a6ef
 * 
 */

const defaultOpts = {
    'interval': 1,
    'maxrecord': 20,
    'drop': 0.2,
    'callback': false
}

export class stats {
    getRecord(key: string, opts: any = {}) {
        opts = Object.assign({}, defaultOpts, opts);

        if (!Memory.sos.stats) {
            Memory.sos.stats = {}
        }

        if (!!opts.value || !!opts.callback) {
            var lasttick = this.getRecordLastTick(key)
            if (!lasttick || Game.time - lasttick >= opts.interval) {
                if (opts.value) {
                    var result = opts.value
                } else {
                    var result = opts.callback()
                }

                if (!isNaN(parseFloat(result)) && isFinite(result)) {
                    if (!Memory.sos.stats[key]) {
                        Memory.sos.stats[key] = {
                            result: [result],
                            time: Game.time
                        }
                    } else {
                        Memory.sos.stats[key].result.unshift(result)
                        Memory.sos.stats[key].time = Game.time
                    }
                }
            }

            if (this.getRecordCount(key) > opts.maxrecord) {
                Memory.sos.stats[key].result.pop()
            }
        } else {
            if (!Memory.sos.stats[key] || !Memory.sos.stats[key].result) {
                return [0]
            }
        }

        if (!Memory.sos.stats[key] || !Memory.sos.stats[key].result) {
            return [0]
        }

        if (opts.drop > 0) {
            var records = _.clone(Memory.sos.stats[key].result)
            var dropamount = Math.floor((records.length * opts.drop) / 2)
            if (dropamount > 0) {
                records.sort((a: number, b: number) => a - b)
                for (var i = 0; i < dropamount; i++) {
                    records.shift()
                    records.pop()
                }
            }
        } else {
            var records = Memory.sos.stats[key].result
        }

        return records
    }

    rollingAverage(key: string, opts = {}) {
        var records = this.getRecord(key, opts)
        var record_sum = records.reduce((a: number, b: number) => a + b, 0)
        if (record_sum == 0) {
            return 0
        }
        return record_sum / records.length
    }

    getHighest(key: string, opts = {}) {
        var records = this.getRecord(key, opts)
        return _.max(records)
    }

    getLowest(key: string, opts = {}) {
        var records = this.getRecord(key, opts)
        return _.min(records.result)
    }

    getAverage(key: string, opts = {}) {
        var records = this.getRecord(key, opts)
        var sum = records.reduce((a: number, b: number) => a + b, 0)
        return sum / records.length
    }

    getStdDev(key: string, opts = {}) {
        var average = this.getAverage(key, opts)
        if (!average) {
            return average
        }
        var records = this.getRecord(key, opts)
        var squareDiffs = records.map(function (value: number) {
            var diff = value - average;
            var sqrDiff = diff * diff;
            return sqrDiff;
        });

        var squareAvg = squareDiffs.reduce((a: number, b: number) => a + b, 0) / squareDiffs.length
        return Math.sqrt(squareAvg);
    }

    getRecordCount = function (key: string) {
        if (!Memory.sos || !Memory.sos.stats || !Memory.sos.stats[key]) {
            return false
        }

        return Memory.sos.stats[key].result.length
    }

    getRecordLastTick = function (key: string) {
        if (!Memory.sos || !Memory.sos.stats || !Memory.sos.stats[key]) {
            return false
        }

        return Memory.sos.stats[key].time
    }

}