declare interface ITestData_Memory {
    NotificationSent: number;
    SleeperReady: boolean;
    expectedSleep: number;
    begun: number;
    testComplete: boolean
    CurStep: number
}

declare var Memory: {
    TestData: ITestData_Memory
}

if (!Memory.TestData) {
    Memory.TestData = {
        NotificationSent: 0,
        SleeperReady: false,
        expectedSleep: 0,
        begun: 0,
        CurStep: 0,
        testComplete: false,
    }
}

import { ProcessBase, ExtensionBase } from "Core/BasicTypes";
export const bundle: IPackage<ITestData_Memory> = {
    install(processRegistry: IProcessRegistry, extensionRegistry: IExtensionRegistry) {
        processRegistry.register(FT_InterruptListener, TestSleeper);
        processRegistry.register(FT_InterruptNotifier, TestInterrupter);
    },
    rootImageName: FT_InterruptListener
}
const PKG_TestInterrupt_LogContext: LogContext = {
    logID: FT_InterruptListener,
    logLevel: LOG_DEBUG
}

class TestSleeper extends ProcessBase {
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
        alert: (message: (string | (() => string))) => { Logger.alert(message, FT_InterruptListener); },
        debug: (message: (string | (() => string))) => { Logger.debug(message, FT_InterruptListener); },
        error: (message: (string | (() => string))) => { Logger.error(message, FT_InterruptListener); },
        fatal: (message: (string | (() => string))) => { Logger.fatal(message, FT_InterruptListener); },
        info: (message: (string | (() => string))) => { Logger.info(message, FT_InterruptListener); },
        trace: (message: (string | (() => string))) => { Logger.trace(message, FT_InterruptListener); },
        warn: (message: (string | (() => string))) => { Logger.warn(message, FT_InterruptListener); },
        CreateLogContext: Logger.CreateLogContext,
        DumpLogToConsole: Logger.DumpLogToConsole
    }

    handleMissingMemory() {
        if (!Memory.TestData) {
            Memory.TestData = {
                NotificationSent: 0,
                SleeperReady: false,
                expectedSleep: 0,
                begun: 0,
                CurStep: 0,
                testComplete: false
            }
        }
        return Memory.TestData;
    }

    executeProcess(): void {
        if (this.memory.SleeperReady && this.memory.NotificationSent) {
            if (this.memory.expectedSleep != Game.time || this.memory.testComplete) {
                if (!this.memory.testComplete) {
                    this.log.error(`Test has failed on step: ${this.memory.CurStep}`);
                }
                this.kernel.killProcess(this.pid);
                this.memory.testComplete = false;
                this.memory.NotificationSent = 0;
                this.memory.SleeperReady = false;
                this.memory.expectedSleep = 0;
                this.memory.begun = 0;
                this.memory.CurStep = 0;
                return;
            } else {
                this.log.info(`Test has passed step: ${this.memory.CurStep}`)
                this.memory.CurStep++;
                this.memory.NotificationSent = 0;
            }
        }

        this.log.debug(`Sleeper tick: ${this.memory.CurStep}`);
        switch (this.memory.CurStep) {
            case (0):
                this.interrupter.Subscribe('Test0', this.pid);
                this.interrupter.Subscribe('Test1', this.pid);
                this.interrupter.Subscribe('Test2', this.pid);
                this.memory.expectedSleep = Game.time + 5;
                break;
            case (1):
                this.interrupter.UnSubscribe(`Test0`, this.pid);
                this.memory.expectedSleep = Game.time + 10;
                break;
            case (2):
                this.interrupter.Subscribe('Test0', this.pid);
                this.memory.expectedSleep = Game.time + 5;
                break;
            case (3):
                this.interrupter.UnSubscribe('Test1', this.pid);
                this.memory.expectedSleep = Game.time + 5;
                break;
            case (4):
                this.interrupter.UnSubscribe('Test0', this.pid);
                this.memory.expectedSleep = Game.time + 15;
                break;
            default:
                this.memory.testComplete = true;
                this.log.warn(`Test has completed`);
                return;
        }

        this.memory.SleeperReady = true;
        this.memory.begun = Game.time;
        this.SetProcessToSleep(60);
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
        alert: (message: (string | (() => string))) => { Logger.alert(message, FT_InterruptListener); },
        debug: (message: (string | (() => string))) => { Logger.debug(message, FT_InterruptListener); },
        error: (message: (string | (() => string))) => { Logger.error(message, FT_InterruptListener); },
        fatal: (message: (string | (() => string))) => { Logger.fatal(message, FT_InterruptListener); },
        info: (message: (string | (() => string))) => { Logger.info(message, FT_InterruptListener); },
        trace: (message: (string | (() => string))) => { Logger.trace(message, FT_InterruptListener); },
        warn: (message: (string | (() => string))) => { Logger.warn(message, FT_InterruptListener); },
        CreateLogContext: Logger.CreateLogContext,
        DumpLogToConsole: Logger.DumpLogToConsole
    }

    executeProcess(): void {
        if (this.memory.SleeperReady) {
            if (Game.time - 4 >= this.memory.begun) {
                let id = `Test${this.memory.NotificationSent}`;
                this.interrupter.Notify(id);
                this.log.debug(`Notifying ${id}`);
                this.memory.NotificationSent++;
                this.memory.begun += 5;
            }
        }
    }
}