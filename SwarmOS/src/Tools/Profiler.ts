declare var MemoryCache: {
  profiler: ProfilerMemory
}

interface ProfilerMemory {
  data: { [name: string]: ProfilerData };
  start?: number;
  total: number;
}

interface ProfilerData {
  calls: number;
  time: number;
}

interface Profiler {
  clear(): void;
  output(): void;
  start(): void;
  status(): void;
  stop(): void;
  toString(): string;
}
declare var _: any;

declare const __PROFILER_ENABLED__: boolean;
global['__PROFILER_ENABLED__'] = true;
/* tslint:disable:ban-types */
export function init(): Profiler {
  const defaults = {
    data: {},
    total: 0,
  };

  if (!MemoryCache.profiler) { MemoryCache.profiler = defaults; }

  const cli: Profiler = {
    clear() {
      const running = isEnabled();
      MemoryCache.profiler = defaults;
      if (running) { MemoryCache.profiler.start = Game.time; }
      return "Profiler MemoryCache cleared";
    },

    output() {
      outputProfilerData();
      return "Done";
    },

    start() {
      MemoryCache.profiler.start = Game.time;
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
      const timeRunning = Game.time - MemoryCache.profiler.start!;
      MemoryCache.profiler.total += timeRunning;
      delete MemoryCache.profiler.start;
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
  const descriptor = Reflect.getOwnPropertyDescriptor(obj, key);
  if (!descriptor || descriptor.get || descriptor.set) { return; }

  if (key === "constructor") { return; }

  const originalFunction = descriptor.value;
  if (!originalFunction || typeof originalFunction !== "function") { return; }

  // set a key for the object in memory
  if (!className) { className = obj.constructor ? `${obj.constructor.name}` : ""; }
  const memKey = className + `:${String(key)}`;

  // set a tag so we don't wrap a function twice
  const savedName = `__${String(key)}__`;
  if (Reflect.has(obj, savedName)) { return; }

  Reflect.set(obj, savedName, originalFunction);

  ///////////

  Reflect.set(obj, key, function (this: any, ...args: any[]) {
    if (isEnabled()) {
      const start = Game.cpu.getUsed();
      const result = originalFunction.apply(this, args);
      const end = Game.cpu.getUsed();
      record(memKey, end - start);
      return result;
    }
    return originalFunction.apply(this, args);
  });
}

export function profile(target: Function): void;
export function profile(target: object, key: string | symbol, _descriptor: TypedPropertyDescriptor<Function>): void;
export function profile(
  target: object | Function,
  key?: string | symbol,
  _descriptor?: TypedPropertyDescriptor<Function>,
): void {
  if (!__PROFILER_ENABLED__) { return; }

  if (key) {
    // case of method decorator
    wrapFunction(target, key);
    return;
  }

  // case of class decorator

  const ctor = target as any;
  if (!ctor.prototype) { return; }

  const className = ctor.name;
  Reflect.ownKeys(ctor.prototype).forEach((k) => {
    wrapFunction(ctor.prototype, k, className);
  });

}

function isEnabled(): boolean {
  return MemoryCache.profiler.start !== undefined;
}

function record(key: string, time: number) {
  if (!MemoryCache.profiler.data[key]) {
    MemoryCache.profiler.data[key] = {
      calls: 0,
      time: 0,
    };
  }
  MemoryCache.profiler.data[key].calls++;
  MemoryCache.profiler.data[key].time += time;
}

interface OutputData {
  name: string;
  calls: number;
  cpuPerCall: number;
  callsPerTick: number;
  cpuPerTick: number;
}

function outputProfilerData() {
  let totalTicks = MemoryCache.profiler.total;
  if (MemoryCache.profiler.start) {
    totalTicks += Game.time - MemoryCache.profiler.start;
  }

  ///////
  // Process data
  let totalCpu = 0;  // running count of average total CPU use per tick
  let calls: number;
  let time: number;
  let result: Partial<OutputData>;
  const data = Reflect.ownKeys(MemoryCache.profiler.data).map((key) => {
    calls = MemoryCache.profiler.data[key as string].calls;
    time = MemoryCache.profiler.data[key as string].time;
    result = {};
    result.name = `${key as string}`;
    result.calls = calls;
    result.cpuPerCall = time / calls;
    result.callsPerTick = calls / totalTicks;
    result.cpuPerTick = time / totalTicks;
    totalCpu += result.cpuPerTick;
    return result as OutputData;
  });

  data.sort((lhs, rhs) => rhs.cpuPerTick - lhs.cpuPerTick);

  ///////
  // Format data
  let output = "";

  // get function name max length
  const longestName = (_.max(data, (d: any) => d.name.length)).name.length + 2;

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


// debugging
// function printObject(obj: object) {
//   const name = obj.constructor ? obj.constructor.name : (obj as any).name;
//   console.log("  Keys of :", name, ":");
//   Reflect.ownKeys(obj).forEach((k) => {
//     try {
//       console.log(`    ${k}: ${Reflect.get(obj, k)}`);
//     } catch (e) {
//       // nothing
//     }
//   });
// }