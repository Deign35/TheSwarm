/**
 * Initial commit was copied from 
 * https://github.com/ScreepsQuorum/screeps-quorum/tree/7254e727868fdc30e93b4e4dc8e015021d08a6ef
 * 
 */
export class Monitor {
    constructor() {
        this.maxbuckets = Math.ceil(this.maxage / this.resolution) + 1;
    }
    resolution: number = 100;
    maxage: number = 3000;
    short: number = 200;
    medium: number = 1000;
    long: number = 3000;
    maxbuckets: number;

    markRun(priority: number) {
        let curBucket = this.resolution * Math.floor(Game.time / this.resolution);
        if (!Memory.sos.monitor.priority_ft[priority]) {
            Memory.sos.monitor.priority_ft[priority] = Game.time
        }
        if (!Memory.sos.monitor.priority_tbr[priority]) {
            Memory.sos.monitor.priority_tbr[priority] = {}
        }
        if (!Memory.sos.monitor.priority_tbr[priority][curBucket]) {
            Memory.sos.monitor.priority_tbr[priority][curBucket] = 0
        }
        Memory.sos.monitor.priority_tbr[priority][curBucket]++

        var buckets = Object.keys(Memory.sos.monitor.priority_tbr[priority])
        if (buckets.length > this.maxbuckets) {
            buckets.sort((a, b) => parseInt(a) - parseInt(b))
            delete Memory.sos.monitor.priority_tbr[priority][buckets[0]]
        }
    }

    getPriorityRunStats(priority: number) {
        if (!Memory.sos.monitor.priority_tbr[priority]) {
            return false
        }

        if (!Memory.sos.monitor.priority_ft[priority]) {
            return false
        }

        let currbucket = this.resolution * Math.floor(Game.time / this.resolution)
        let currticks = Game.time - currbucket
        //let numticks = this.resolution * Math.ceil(numticks / this.resolution);
        let numticks = this.resolution * Math.ceil(currticks / this.resolution);
        let numbuckets = this.long / this.resolution
        if (Game.time - Memory.sos.monitor.priority_ft[priority] < (+numticks + +this.resolution)) {
            return false
        }

        var data = Memory.sos.monitor.priority_tbr[priority]
        var buckets = Object.keys(data)
        buckets.sort((a, b) => parseInt(b) - parseInt(a))

        if (!data[currbucket]) {
            data[currbucket] = 0
        }

        var shortticks = data[currbucket]
        var mediumticks = data[currbucket]
        var longticks = data[currbucket]
        for (var i = 1; i <= numbuckets; i++) {
            var count = i * this.resolution
            var thisbucket = currbucket - count
            if (!!data[thisbucket]) {
                if (count <= this.short) {
                    shortticks += data[thisbucket]
                }
                if (count <= this.medium) {
                    mediumticks += data[thisbucket]
                }
                if (count <= this.long) {
                    longticks += data[thisbucket]
                }
            }
        }

        return {
            short: Math.max((this.short + currticks) / shortticks, 1),
            medium: Math.max((this.medium + currticks) / mediumticks, 1),
            long: Math.max((this.long + currticks) / longticks, 1),
        }
    }
}
