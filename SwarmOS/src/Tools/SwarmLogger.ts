interface ILogLevelSetting {
    color: string,
    level: number
}

const LOGGER_SEPARATOR = `<font color="green">-----------------------------------------------------------------------</font>`;
const CONTEXT_SEPARATOR = `<font color="yellow">-----------------------------------------------------------------------</font>`;

const LOGGER_SETTINGS: IDictionary<ILogLevelSetting> = {
    [LOG_ALERT]: {
        color: '#C050E1', // Purple
        level: 6
    },
    [LOG_DEBUG]: {
        color: '#00C6B6', // Teal
        level: 1
    },
    [LOG_ERROR]: {
        color: '#E65C00', // Red
        level: 4
    },
    [LOG_FATAL]: {
        color: '#FF0066', // Fuscia(sp?)
        level: 5
    },
    [LOG_INFO]: {
        color: '#FFFFFF', // White
        level: 2
    },
    [LOG_TRACE]: {
        color: '#666666', // Dark Grey
        level: 0
    },
    [LOG_WARN]: {
        color: '#F4D000', // Yellow
        level: 3
    }
}
const ShouldLog = function (minLevel: LogLevel, messageLevel: LogLevel) {
    return LOGGER_SETTINGS[minLevel].level <= LOGGER_SETTINGS[messageLevel].level
}
interface Context {
    logLevel: LogLevel,
    logs: {
        [id: number]: (string | (() => string))[]
    }
}

const DEFAULT_LOG_LEVEL: LogLevel = Game.rooms['sim'] ? LOG_TRACE : LOG_INFO;
const DEFAULT_LOG_ID = 'SwarmOS';
export class SwarmLogger implements ILogger {
    constructor() {
        this.logContexts = {};
        this.InitQueue();
    }
    private logContexts: IDictionary<Context>;
    protected InitQueue(): void {
        let ids = Object.keys(this.logContexts);
        for (let i = 0, length = ids.length; i < length; i++) {
            this.logContexts[ids[i]].logs = {};
        }

        if (!this.logContexts[DEFAULT_LOG_ID]) {
            this.CreateLogContext({ logID: DEFAULT_LOG_ID, logLevel: DEFAULT_LOG_LEVEL });
        }
    }
    CreateLogContext(context: LogContext): void {
        if (!this.logContexts[context.logID]) {
            this.logContexts[context.logID] = {
                logLevel: context.logLevel || DEFAULT_LOG_LEVEL,
                logs: [],
                //counter: false // (TODO) prepend a counter to logs.
            }
        }
    }

    protected log(message: (string | (() => string)), contextID: string = DEFAULT_LOG_ID, severity: LogLevel = LOG_INFO) {
        let context = this.logContexts[contextID];
        if (!context) {
            this.CreateLogContext({ logID: contextID, logLevel: DEFAULT_LOG_LEVEL });
            context = this.logContexts[contextID];
        }
        if (ShouldLog(context.logLevel, severity)) {
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

        let introStr = `${LOGGER_SEPARATOR}\n<font color="${LOGGER_SETTINGS[LOG_ALERT].color}">Begin SwarmOS Log - [${Game.time}]`
        if (endTick) {
            introStr += `\nCPU: (${startLoggingTime}\/${Game.cpu.limit} -- [${Game.cpu.bucket}])</font>`;
        }

        console.log(introStr);
        for (let i = 0; i < logOutputs.length; i++) {
            console.log(logOutputs[i]);
        }

        // Reset the logger
        this.InitQueue();
        console.log(`<font color="${LOGGER_SETTINGS[LOG_ALERT].color}">End Logging(${Game.cpu.getUsed() - startLoggingTime})</font>\n${LOGGER_SEPARATOR}`);
    }

    private compileContext(logID: string, context: Context) {
        let queues = context.logs;
        let hasLogs = false;
        let output = () => {
            let outStr = `${CONTEXT_SEPARATOR}\n<font color="${LOGGER_SETTINGS[LOG_WARN].color}">Begin Log[${logID}] - {${context.logLevel}}</font>\n`;
            //for (let i = ERROR_COLORS.length - 1; i >= 0; i--) {
            for (let settingID in LOGGER_SETTINGS) {
                if (!queues[settingID] || queues[settingID].length == 0) {
                    continue;
                }
                let color = LOGGER_SETTINGS[settingID].color;
                outStr += `<font color="${color}">`
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