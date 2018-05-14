interface ILogLevelSetting {
    level: number,
    font: {
        color: string,
        size: number
    }
}

const LOGGER_SEPARATOR = `<font color="yellow">-----------------------------------------------------------------------</font>`;
const CONTEXT_SEPARATOR = `<font color="green">-----------------------------------------------------------------------</font>`;

const DEFAULT_LOG_FONT_SIZE = 2;
const LOGGER_SETTINGS: SDictionary<ILogLevelSetting> = {
    [LOG_ALERT]: {
        level: 6,
        font: {
            color: '#C050E1', // Purple
            size: DEFAULT_LOG_FONT_SIZE + 1,
        }
    },
    [LOG_DEBUG]: {
        level: 1,
        font: {
            color: '#00C6B6', // Teal
            size: DEFAULT_LOG_FONT_SIZE - 0.5,
        }
    },
    [LOG_ERROR]: {
        level: 4,
        font: {
            color: '#E65C00', // Red
            size: DEFAULT_LOG_FONT_SIZE + 0.5,
        }
    },
    [LOG_FATAL]: {
        level: 5,
        font: {
            color: '#FF0066', // Fuscia(sp?)
            size: DEFAULT_LOG_FONT_SIZE + 0.75,
        }
    },
    [LOG_INFO]: {
        level: 2,
        font: {
            color: '#FFFFFF', // White
            size: DEFAULT_LOG_FONT_SIZE,
        }
    },
    [LOG_TRACE]: {
        level: 0,
        font: {
            color: '#666666', // Dark Grey
            size: DEFAULT_LOG_FONT_SIZE - 1,
        }
    },
    [LOG_WARN]: {
        level: 3,
        font: {
            color: '#F4D000', // Yellow
            size: DEFAULT_LOG_FONT_SIZE + 0.25,
        }
    }
}
interface LoggerContext {
    logLevel: LogLevel,
    logs: {
        [id: number]: (string | (() => string))[]
    }
}

export class Logger implements IKernelLoggerExtensions {
    constructor() {
        this.logContexts = {};
        this.InitQueue();
    }
    private logContexts: SDictionary<LoggerContext>;

    protected InitQueue(): void {
        let ids = Object.keys(this.logContexts);
        for (let i = 0, length = ids.length; i < length; i++) {
            this.logContexts[ids[i]].logs = {};
        }

        if (!this.logContexts[DEFAULT_LOG_ID]) {
            this.CreateLogContext(DEFAULT_LOG_ID, DEFAULT_LOG_LEVEL);
        }
    }

    protected log(message: (string | (() => string)), contextID: string = DEFAULT_LOG_ID, severity: LogLevel = DEFAULT_LOG_LEVEL) {
        let context = this.logContexts[contextID];
        if (!context) {
            this.logContexts[contextID] = {
                logLevel: DEFAULT_LOG_LEVEL,
                logs: [],
            }
            context = this.logContexts[contextID];
        }
        if (this.ShouldLog(context.logLevel, severity)) {
            if (!context.logs[severity]) {
                context.logs[severity] = [];
            }
            context.logs[severity].push(message);
        }
    }

    alert(message: (string | (() => string)), contextID?: string) { return this.log(message, contextID, LOG_ALERT); }
    debug(message: (string | (() => string)), contextID?: string) { return this.log(message, contextID, LOG_DEBUG); }
    error(message: (string | (() => string)), contextID?: string) { return this.log(message, contextID, LOG_ERROR); }
    fatal(message: (string | (() => string)), contextID?: string) { return this.log(message, contextID, LOG_FATAL); }
    info(message: (string | (() => string)), contextID?: string) { return this.log(message, contextID, LOG_INFO); }
    trace(message: (string | (() => string)), contextID?: string) { return this.log(message, contextID, LOG_TRACE); }
    warn(message: (string | (() => string)), contextID?: string) { return this.log(message, contextID, LOG_WARN); }

    CreateLogContext(logID: string, logLevel: LogLevel): ILogger {
        if (!this.logContexts[logID]) {
            this.logContexts[logID] = {
                logLevel: logLevel || DEFAULT_LOG_LEVEL,
                logs: [],
                //counter: false // (TODO) prepend a counter to logs.
            }
        }

        let self = this;
        return {
            alert: (message: (string | (() => string))) => { self.alert(message, logID); },
            debug: (message: (string | (() => string))) => { self.debug(message, logID); },
            error: (message: (string | (() => string))) => { self.error(message, logID); },
            fatal: (message: (string | (() => string))) => { self.fatal(message, logID); },
            info: (message: (string | (() => string))) => { self.info(message, logID); },
            trace: (message: (string | (() => string))) => { self.trace(message, logID); },
            warn: (message: (string | (() => string))) => { self.warn(message, logID); }
        }
    }

    DumpLogToConsole(endTick: boolean = true): void {
        let startLoggingTime = Game.cpu.getUsed();

        let logOutputs = [];
        let ids = Object.keys(this.logContexts);
        for (let i = 0, length = ids.length; i < length; i++) {
            let context = this.logContexts[ids[i]];
            let log = this.compileContext(ids[i], context);

            if (log) {
                logOutputs.push(log);
            }
        }

        let introStr = `${LOGGER_SEPARATOR}\n${this.MakeFontTag(LOG_ALERT)}Begin SwarmOS Log - [${Game.time}]`
        if (endTick) {
            introStr += `\nCPU: (${startLoggingTime}\/${Game.cpu.limit} -- [${Game.cpu.bucket}])`;
        }
        introStr += `</font>`

        console.log(introStr);
        for (let i = 0; i < logOutputs.length; i++) {
            console.log(logOutputs[i]);
        }

        // Reset the logger
        this.InitQueue();
        console.log(`${this.MakeFontTag(LOG_ALERT)}End Logging(${Game.cpu.getUsed() - startLoggingTime})</font>\n${LOGGER_SEPARATOR}`);
    }

    private ShouldLog(minLevel: LogLevel, messageLevel: LogLevel) {
        return LOGGER_SETTINGS[minLevel].level <= LOGGER_SETTINGS[messageLevel].level
    }
    private MakeFontTag(level: LogLevel) {
        return `<font size="${LOGGER_SETTINGS[level].font.size}" color="${LOGGER_SETTINGS[level].font.color}">`
    }

    private compileContext(logID: string, context: LoggerContext) {
        let queues = context.logs;
        let hasLogs = false;
        let output = () => {
            let outStr = `${CONTEXT_SEPARATOR}\n${this.MakeFontTag(LOG_WARN)}Begin Log[${logID}] - {${context.logLevel}}</font>\n`;
            for (let settingID in LOGGER_SETTINGS) {
                if (!queues[settingID] || queues[settingID].length == 0) {
                    continue;
                }

                outStr += this.MakeFontTag(settingID as LogLevel);
                while (queues[settingID].length > 0) {
                    let nextMessage = queues[settingID].shift();
                    if (nextMessage) {
                        if (typeof nextMessage === "function") {
                            nextMessage = `[DL]${nextMessage()}`;
                        }
                        hasLogs = true;
                        outStr += `${nextMessage}\n`;
                    }
                }
                outStr += `</font>`;
            }
            outStr += `${CONTEXT_SEPARATOR}\n`;
            return outStr;
        }

        let compiledLog = output();
        return hasLogs ? compiledLog : undefined;
    }
}