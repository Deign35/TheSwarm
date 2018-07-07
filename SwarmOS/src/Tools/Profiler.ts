
declare interface ProfilerFile {
    data: any,
    total: number,
    start?: number
}

interface OutputData {
    name: string;
    calls: number;
    cpuPerCall: number;
    callsPerTick: number;
    cpuPerTick: number;
}
const PROFILER_PATH = `${SEG_Master_Drive}${C_SEPERATOR}Core`
const PROFILER_FILENAME = `Profiler`
export class ImplementedProfiler implements IProfiler {
    constructor() {
        this._fsHash = MasterFS.FSHash;
        this._folder = MasterFS.GetFolder(PROFILER_PATH)!;
        if (!this._folder) {
            MasterFS.EnsurePath(PROFILER_PATH);
            this._folder = MasterFS.GetFolder(PROFILER_PATH)!;
        }
        if (!this._folder.GetFile(PROFILER_FILENAME)) {
            this._folder.CreateFile<ProfilerMemory>(PROFILER_FILENAME, {
                data: {},
                total: 0
            })
        }
    }
    private _fsHash!: string;
    private _folder!: IFolder;
    get folder() {
        if (this._fsHash != MasterFS.FSHash) {
            MasterFS.EnsurePath(PROFILER_PATH);
            this._folder = MasterFS.GetFolder(PROFILER_PATH)!;
        }
        return this._folder;
    }
    get file(): IFile<ProfilerMemory> {
        return this.folder!.GetFile<ProfilerMemory>(PROFILER_FILENAME)!;
    }
    isEnabled() {
        return !!this.file.Get('start');
    }

    clear() {
        let clearedMem: ProfilerMemory = {
            data: {},
            total: 0
        }
        if (this.isEnabled()) {
            clearedMem.start = Game.time;
        }
        this.folder.CreateFile(PROFILER_FILENAME, clearedMem);
        return 'Profiler memory cleared'
    }

    output() {
        let totalTicks = this.file.Get('total') || 1;
        if (this.file.Get('start')) {
            totalTicks += (Game.time - (this.file.Get('start') || 0));
        }

        ///////
        // Process data
        let totalCpu = 0;  // running count of average total CPU use per tick
        let calls: number;
        let time: number;
        let result: Partial<OutputData>;
        let rawData = this.file.Get('data');
        const data = Object.getOwnPropertyNames(rawData).map((key) => {
            calls = rawData[key].calls;
            time = rawData[key].time;
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
        return 'Profiler output complete';
    }
    start() {
        if (this.isEnabled()) {
            this.stop();
        }
        this.file.Set('start', Game.time);
        return 'Profiler start ' + Game.time;
    }
    stop() {
        if (!this.isEnabled()) {
            return;// 'Attempted to stop profiler, but its already stopped(' + Game.time + ').';
        }
        const timeRunning = (Game.time - (this.file.Get('start') || 0)) || 1;
        this.file.Set('total', timeRunning + this.file.Get('total'));
        this.file.Remove('start');

        return 'Profiler end ' + Game.time;
    }
    toString() {
        return "Profiler.start() - Starts the profiler\n" +
            "Profiler.stop() - Stops/Pauses the profiler\n" +
            "Profiler.status() - Returns whether is profiler is currently running or not\n" +
            "Profiler.output() - Pretty-prints the collected profiler data to the console\n" +
            this.isEnabled();
    }
    record(key: string, time: number) {
        let data = this.file.Get('data');
        let dataRecord = data[key];
        if (!dataRecord) {
            data[key] = {
                calls: 0,
                time: 0,
            };
            dataRecord = data[key];
        }
        dataRecord.calls++;
        dataRecord.time += time;
    }
}

function wrapFunction(obj: object, key: string, className?: string) {
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
        if (!!(MasterFS.GetFolder(PROFILER_PATH)!.GetFile<ProfilerMemory>(PROFILER_FILENAME)!.Get('start'))) {
            const start = Game.cpu.getUsed();
            const result = originalFunction.apply(this, args);
            const end = Game.cpu.getUsed();
            Profiler.record(memKey, end - start);
            return result;
        }
        return originalFunction.apply(this, args);
    };
}

export function profile(target: Function): void;
export function profile(target: object, key: string, _descriptor: TypedPropertyDescriptor<Function>): void;
export function profile(
    target: object | Function,
    key?: string,
    _descriptor?: TypedPropertyDescriptor<Function>,
): void {
    if ((C_PROFILER_ENABLED as number) == 0) {
        return;
    }
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