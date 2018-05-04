/**
 * Initial commit was copied from 
 * https://github.com/ScreepsQuorum/screeps-quorum/tree/7254e727868fdc30e93b4e4dc8e015021d08a6ef
 * 
 */

import { Process } from "./Process";
import { Scheduler } from "./Scheduler";

declare const BUCKET_EMERGENCY = 1000;
global.BUCKET_EMERGENCY = 1000

declare const BUCKET_FLOOR = 2000;
global.BUCKET_FLOOR = 2000

declare const BUCKET_CEILING = 9500;
global.BUCKET_CEILING = 9500

const BUCKET_BUILD_LIMIT = 15000
const CPU_BUFFER = 130
const CPU_MINIMUM = 0.30
const CPU_ADJUST = 0.05
const CPU_GLOBAL_BOOST = 60
const MINIMUM_PROGRAMS = 0.3
const PROGRAM_NORMALIZING_BURST = 2
const RECURRING_BURST = 1.75
const RECURRING_BURST_FREQUENCY = 25
const MIN_TICKS_BETWEEN_GC = 20
const GLOBAL_LAST_RESET = Game.time
const IVM = typeof Game.cpu.getHeapStatistics === 'function'

declare var Memory: any;

class kernel {
    constructor() {
        global.kernel = this
        this.newglobal = GLOBAL_LAST_RESET === Game.time
        this.simulation = !!Game.rooms['sim']
        this.scheduler = new Scheduler();
        this.Process = Process;
    }
    private newglobal: boolean;
    private simulation: boolean;
    scheduler: Scheduler;
    Process: typeof Process;

    start() {
        if (IVM) {
            Logger.log(`Initializing Kernel for tick ${Game.time} with IVM support`, LOG_TRACE)
        } else {
            Logger.log(`Initializing Kernel for tick ${Game.time}`, LOG_TRACE)
        }

        if (this.newglobal) {
            Logger.log(`New Global Detected`, LOG_INFO)
        }

        if (IVM && global.gc && (!Memory.qos.gc || Game.time - Memory.qos.gc >= MIN_TICKS_BETWEEN_GC)) {
            const heap = Game.cpu.getHeapStatistics!()
            const heapPercent = heap.total_heap_size / heap.heap_size_limit;
            if (heapPercent > 0.95) {
                Logger.log(`Garbage Collection Initiated`, LOG_INFO)
                Memory.qos.gc = Game.time
                global.gc()
            }
        }

        if (Game.time % 7 === 0) {
            this.cleanMemory()
        }

        this.scheduler.wakeSleepingProcesses()
        this.scheduler.shift()

        if (this.scheduler.getProcessCount() <= 0) {
            this.scheduler.launchProcess('player')
        }
    }

    cleanMemory() {
        Logger.log('Cleaning memory', LOG_TRACE)
        let keys = Object.keys(Memory.Creeps);
        for (let i = 0; i < keys.length; i++) {
            if (!Game.creeps[keys[i]]) {
                delete Memory.creeps[keys[i]]
            }
        }
        sos.lib.cache.clean()
    }

    run() {
        while (this.shouldContinue()) {
            const runningProcess = this.scheduler.getNextProcess()
            if (!runningProcess) {
                return
            }
            
            try {
                let processName = runningProcess.name
                const descriptor = runningProcess.getDescriptor()
                if (descriptor) {
                    processName += ' ' + descriptor
                }

                Logger.log(`Running ${processName} (pid ${runningProcess.pid})`, LOG_TRACE);
                const startCpu = Game.cpu.getUsed();
                runningProcess.run()
            } catch (err) {
                let message = 'program error occurred\n'
                message += `process ${runningProcess.pid}: ${runningProcess.name}\n`
                message += !!err && !!err.stack ? err.stack : err.toString()
                Logger.log(message, LOG_ERROR)
            }
        }
    }

    sigmoid(x: number) {
        return 1.0 / (1.0 + Math.exp(-x))
    }

    sigmoidSkewed(x: number) {
        return this.sigmoid((x * 12.0) - 6.0)
    }

    shouldContinue() {
        if (this.simulation) {
            return true
        }

        // If the bucket has dropped below the emergency level enable the bucket rebuild functionality.
        if (Game.cpu.bucket <= BUCKET_EMERGENCY) {
            if (!Memory.qos.last_build_bucket || (Game.time - Memory.qos.last_build_bucket) > BUCKET_BUILD_LIMIT) {
                Memory.qos.build_bucket = true
                Memory.qos.last_build_bucket = Game.time
                return false
            }
        }

        // If the bucket rebuild flag is set don't run anything until the bucket has been reset.
        if (Memory.qos.build_bucket) {
            if (Game.cpu.bucket >= BUCKET_CEILING) {
                delete Memory.qos.build_bucket
            } else {
                return false
            }
        }

        // Make sure to stop if cpuUsed has hit the maximum allowed cpu.
        const cpuUsed = Game.cpu.getUsed()
        if (cpuUsed >= Game.cpu.tickLimit - CPU_BUFFER) {
            return false
        }

        // Allow if the cpu used is less than this tick's limit.
        const cpuLimit = this.getCpuLimit()
        if (cpuUsed < cpuLimit) {
            return true
        }

        // Ensure that a minumum number of processes runs each tick.
        // This is primarily useful for garbage collection cycles.
        if (Game.cpu.bucket > BUCKET_FLOOR) {
            const total = this.scheduler.getProcessCount()
            const completed = this.scheduler.getCompletedProcessCount()
            if (completed / total < MINIMUM_PROGRAMS) {
                if (cpuUsed < cpuLimit * PROGRAM_NORMALIZING_BURST) {
                    return true
                }
            }
        }

        return false
    }

    private _cpuLimit?: number;
    getCpuLimit() {
        if (Game.cpu.bucket > BUCKET_CEILING) {
            return Math.min(Game.cpu.tickLimit - CPU_BUFFER, Game.cpu.bucket * 0.05)
        }

        if (Game.cpu.bucket < BUCKET_EMERGENCY) {
            return 0
        }

        if (Game.cpu.bucket < BUCKET_FLOOR) {
            return Game.cpu.limit * CPU_MINIMUM
        }

        if (!this._cpuLimit) {
            const bucketRange = BUCKET_CEILING - BUCKET_FLOOR
            const depthInRange = (Game.cpu.bucket - BUCKET_FLOOR) / bucketRange
            const minToAllocate = Game.cpu.limit * CPU_MINIMUM
            const maxToAllocate = Game.cpu.limit
            this._cpuLimit = (minToAllocate + this.sigmoidSkewed(depthInRange) *
                (maxToAllocate - minToAllocate)) * (1 - CPU_ADJUST);
            
            if (this.newglobal) {
                this._cpuLimit += CPU_GLOBAL_BOOST
            } else if (RECURRING_BURST_FREQUENCY && Game.time % RECURRING_BURST_FREQUENCY === 0) {
                this._cpuLimit *= RECURRING_BURST
            }
        }

        return this._cpuLimit
    }

    shutdown() {
        const processCount = this.scheduler.getProcessCount()
        const completedCount = this.scheduler.memory.processes.completed.length

        Logger.log(`Processes Run: ${completedCount}/${processCount}`, LOG_INFO)
        Logger.log(`Tick Limit: ${Game.cpu.tickLimit}`, LOG_INFO)
        Logger.log(`Kernel Limit: ${this.getCpuLimit()}`, LOG_INFO)
        Logger.log(`CPU Used: ${Game.cpu.getUsed()}`, LOG_INFO)
        Logger.log(`Bucket: ${Game.cpu.bucket}`, LOG_INFO)

        if (IVM) {
            const heap = Game.cpu.getHeapStatistics!()
            const heapPercent = Math.round((heap.total_heap_size / heap.heap_size_limit) * 100)
            Logger.log(`Heap Used: ${heapPercent} (${heap.total_heap_size} / ${heap.heap_size_limit})`, LOG_INFO)
        }
    }
}