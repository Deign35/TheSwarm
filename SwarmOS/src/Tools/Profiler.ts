declare var Memory: {
    profiler: ProfilerMemory
}
export function init(): IProfiler {
    const defaults = {
        data: {},
        total: 0,
    };

    if (!Memory.profiler) { Memory.profiler = defaults; }

    const cli: IProfiler = {
        clear() {
            const running = isEnabled();
            Memory.profiler = defaults;
            if (running) { Memory.profiler.start = Game.time; }
            return "Profiler Memory cleared";
        },

        output() {
            outputProfilerData();
            return "Done";
        },

        start() {
            Memory.profiler.start = Game.time;
            return "Profiler started";
        },

        status() {
            if (isEnabled()) {
                return "Profiler is running";
            }
            return "Profiler is stopped";
        },

        stop() {
            if (!isEnabled()) { return; }
            const timeRunning = (Game.time - Memory.profiler.start!) || 1;
            Memory.profiler.total += timeRunning;
            delete Memory.profiler.start;
            return "Profiler stopped";
        },

        toString() {
            return "Profiler.start() - Starts the profiler\n" +
                "Profiler.stop() - Stops/Pauses the profiler\n" +
                "Profiler.status() - Returns whether is profiler is currently running or not\n" +
                "Profiler.output() - Pretty-prints the collected profiler data to the console\n" +
                this.status();
        },
    };

    return cli;
}

function wrapFunction(obj: object, key: PropertyKey, className?: string) {
    const descriptor = Object.getOwnPropertyDescriptor(obj, key);
    if (!descriptor || descriptor.get || descriptor.set) { return; }

    if (key === "constructor") { return; }

    const originalFunction = descriptor.value;
    if (!originalFunction || typeof originalFunction !== "function") { return; }

    // set a key for the object in memory
    if (!className) { className = obj.constructor ? `${obj.constructor.name}` : ""; }
    const memKey = className + `:${key}`;

    // set a tag so we don't wrap a function twice
    const savedName = `__${key}__`;
    if (obj[savedName]) { return; }

    obj[savedName] = originalFunction;

    ///////////

    obj[key] = function (this: any, ...args: any[]) {
        if (isEnabled()) {
            const start = Game.cpu.getUsed();
            const result = originalFunction.apply(this, args);
            const end = Game.cpu.getUsed();
            record(memKey, end - start);
            return result;
        }
        return originalFunction.apply(this, args);
    };
}

export function profile(target: Function): void;
export function profile(target: object, key: string | symbol, _descriptor: TypedPropertyDescriptor<Function>): void;
export function profile(
    target: object | Function,
    key?: string | symbol,
    _descriptor?: TypedPropertyDescriptor<Function>,
): void {
    if (key) {
        // case of method decorator
        wrapFunction(target, key);
        return;
    }

    // case of class decorator

    const ctor = target as any;
    if (!ctor.prototype) { return; }

    const className = ctor.name;
    Object.getOwnPropertyNames(ctor.prototype).forEach((k) => {
        wrapFunction(ctor.prototype, k, className);
    });

}

function isEnabled(): boolean {
    return Memory.profiler.start !== undefined;
}

function record(key: string | symbol, time: number) {
    if (!Memory.profiler.data[key]) {
        Memory.profiler.data[key] = {
            calls: 0,
            time: 0,
        };
    }
    Memory.profiler.data[key].calls++;
    Memory.profiler.data[key].time += time;
}

interface OutputData {
    name: string;
    calls: number;
    cpuPerCall: number;
    callsPerTick: number;
    cpuPerTick: number;
}

function outputProfilerData() {
    let totalTicks = Memory.profiler.total;
    if (Memory.profiler.start) {
        totalTicks += (Game.time - Memory.profiler.start) + 1;
    }

    ///////
    // Process data
    let totalCpu = 0;  // running count of average total CPU use per tick
    let calls: number;
    let time: number;
    let result: Partial<OutputData>;
    const data = Object.getOwnPropertyNames(Memory.profiler.data).map((key) => {
        calls = Memory.profiler.data[key].calls;
        time = Memory.profiler.data[key].time;
        result = {};
        result.name = `${key}`;
        result.calls = calls;
        result.cpuPerCall = time / calls;
        result.callsPerTick = calls / totalTicks;
        result.cpuPerTick = time / totalTicks;
        totalCpu += result.cpuPerTick;
        return result as OutputData;
    });

    if (Object.keys(data).length == 0) {
        return;
    }
    data.sort((lhs, rhs) => rhs.cpuPerTick - lhs.cpuPerTick);
    RawMemory.segments[SEG_Profiler] = (JSON.stringify(data));
    GStats.addSimpleStat('totalCPU', totalCpu);

    ///////
    // Format data
    let output = "";

    // get function name max length
    const longestName = (_.max(data, (d) => d.name.length)).name.length + 2;

    //// Header line
    output += _.padRight("Function", longestName);
    output += _.padLeft("Tot Calls", 12);
    output += _.padLeft("CPU/Call", 12);
    output += _.padLeft("Calls/Tick", 12);
    output += _.padLeft("CPU/Tick", 12);
    output += _.padLeft("% of Tot\n", 12);

    ////  Data lines
    data.forEach((d) => {
        output += _.padRight(`${d.name}`, longestName);
        output += _.padLeft(`${d.calls}`, 12);
        output += _.padLeft(`${d.cpuPerCall.toFixed(2)}ms`, 12);
        output += _.padLeft(`${d.callsPerTick.toFixed(2)}`, 12);
        output += _.padLeft(`${d.cpuPerTick.toFixed(2)}ms`, 12);
        output += _.padLeft(`${(d.cpuPerTick / totalCpu * 100).toFixed(0)} %\n`, 12);
    });

    //// Footer line
    output += `${totalTicks} total ticks measured`;
    output += `\t\t\t${totalCpu.toFixed(2)} average CPU profiled per tick`;
    console.log(output);
}