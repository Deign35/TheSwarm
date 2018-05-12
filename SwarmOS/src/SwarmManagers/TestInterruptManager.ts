declare interface ITestData_Memory {
    testComplete: boolean;
    SleeperReady: boolean;
    expectedSleep: number;
    begun: number;
}

declare var Memory: {
    TestData: ITestData_Memory
}
if (!Memory.TestData) {
    Memory.TestData = {
        testComplete: false,
        SleeperReady: false,
        expectedSleep: 0,
        begun: 0
    }
}

import { ProcessBase, ExtensionBase } from "Core/BasicTypes";
export const bundle: IPackage<ITestData_Memory> = {
    install(processRegistry: IProcessRegistry, extensionRegistry: IExtensionRegistry) {
        processRegistry.register(PKG_TestInterrupt, TestSleeper);
        processRegistry.register('PKG_Test2', TestInterrupter);
    },
    rootImageName: PKG_TestInterrupt
}
const PKG_TestInterrupt_LogContext: LogContext = {
    logID: PKG_TestInterrupt,
    logLevel: LOG_DEBUG
}

class TestSleeper extends ProcessBase {
    protected OnLoad(): void {
    }
    constructor(protected context: IProcessContext) {
        super(context);
        Logger.CreateLogContext(PKG_TestInterrupt_LogContext);
    }
    protected get memory() {
        return Memory.TestData;
    }
    protected get log() {
        return this._logger;
    }
    private _logger: ILogger = {
        alert: (message: (string | (() => string))) => { Logger.alert(message, PKG_TestInterrupt); },
        debug: (message: (string | (() => string))) => { Logger.debug(message, PKG_TestInterrupt); },
        error: (message: (string | (() => string))) => { Logger.error(message, PKG_TestInterrupt); },
        fatal: (message: (string | (() => string))) => { Logger.fatal(message, PKG_TestInterrupt); },
        info: (message: (string | (() => string))) => { Logger.info(message, PKG_TestInterrupt); },
        trace: (message: (string | (() => string))) => { Logger.trace(message, PKG_TestInterrupt); },
        warn: (message: (string | (() => string))) => { Logger.warn(message, PKG_TestInterrupt); },
        CreateLogContext: Logger.CreateLogContext,
        DumpLogToConsole: Logger.DumpLogToConsole
    }

    handleMissingMemory() {
        if (!Memory.TestData) {
            Memory.TestData = {
                testComplete: false,
                SleeperReady: false,
                expectedSleep: 0,
                begun: 0
            }
        }
        return Memory.TestData;
    }
    executeProcess(): void {
        this.log.debug('Sleeper tick');
        if (!this.memory.SleeperReady) {
            this.log.debug('Set subscription')
            this.interupter.Subscribe('test', this.pid);
            this.memory.SleeperReady = true;
            let randomSleep = GetRandomIndex(primes_300);
            this.memory.expectedSleep = Game.time + randomSleep;
            this.memory.begun = Game.time;
            this.log.info(`Sleep for ${randomSleep} -- Expected wake up @ ${this.memory.expectedSleep}`)
            this.SetProcessToSleep(randomSleep);
        } else {
            this.log.debug(`Retick occurred @ ${Game.time}`);
            this.kernel.killProcess(this.pid);
            this.memory.testComplete = false;
            this.memory.SleeperReady = false;
            this.memory.expectedSleep = 0;
            this.memory.begun = 0;
        }
    }
}

class TestInterrupter extends ProcessBase {
    protected OnLoad(): void { }
    constructor(protected context: IProcessContext) {
        super(context);
        Logger.CreateLogContext(PKG_TestInterrupt_LogContext);
    }
    protected get memory() {
        return Memory.TestData;
    }
    protected get log() {
        return this._logger;
    }
    private _logger: ILogger = {
        alert: (message: (string | (() => string))) => { Logger.alert(message, PKG_TestInterrupt); },
        debug: (message: (string | (() => string))) => { Logger.debug(message, PKG_TestInterrupt); },
        error: (message: (string | (() => string))) => { Logger.error(message, PKG_TestInterrupt); },
        fatal: (message: (string | (() => string))) => { Logger.fatal(message, PKG_TestInterrupt); },
        info: (message: (string | (() => string))) => { Logger.info(message, PKG_TestInterrupt); },
        trace: (message: (string | (() => string))) => { Logger.trace(message, PKG_TestInterrupt); },
        warn: (message: (string | (() => string))) => { Logger.warn(message, PKG_TestInterrupt); },
        CreateLogContext: Logger.CreateLogContext,
        DumpLogToConsole: Logger.DumpLogToConsole
    }

    handleMissingMemory() {
        if (!Memory.TestData) {
            Memory.TestData = {
                testComplete: false,
                SleeperReady: false,
                expectedSleep: 0,
                begun: 0
            }
        }
        return Memory.TestData;
    }
    executeProcess(): void {
        if (this.memory.SleeperReady) {
            if (Game.time - 5 > this.memory.begun) {
                this.interupter.Notify('test');
                this.log.debug(`Notifying test`);
            }
        }
    }
}