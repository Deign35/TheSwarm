interface ILogLevelSetting {
    level: number,
    font: {
        color: string,
        size: number
    }
}

const LOGGER_SEPARATOR = `<font color="yellow">-----------------------------------------------------------------------</font>`;
const CONTEXT_SEPARATOR = `<font color="green">-----------------------------------------------------------------------</font>`;

const DEFAULT_LOG_FONT_SIZE = 1;
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
const ShouldLog = function (minLevel: LogLevel, messageLevel: LogLevel) {
    return LOGGER_SETTINGS[minLevel].level <= LOGGER_SETTINGS[messageLevel].level
}
const MakeFontTag = function (level: LogLevel) {
    return `<font size="${LOGGER_SETTINGS[level].font.size}" color="${LOGGER_SETTINGS[level].font.color}">`
}
interface Context {
    logLevel: LogLevel,
    logs: {
        [id: number]: (string | (() => string))[]
    }
}

const DEFAULT_LOG_LEVEL: LogLevel = LOG_INFO; // Game.rooms['sim'] ? LOG_TRACE : LOG_INFO;
const DEFAULT_LOG_ID = 'SwarmOS';
export class SwarmLogger implements ILogger {
    constructor() {
        this.logContexts = {};
        this.InitQueue();
    }
    private logContexts: SDictionary<Context>;
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

        let introStr = `${LOGGER_SEPARATOR}\n${MakeFontTag(LOG_ALERT)}Begin SwarmOS Log - [${Game.time}]`
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
        console.log(`${MakeFontTag(LOG_ALERT)}End Logging(${Game.cpu.getUsed() - startLoggingTime})</font>\n${LOGGER_SEPARATOR}`);
    }

    private compileContext(logID: string, context: Context) {
        let queues = context.logs;
        let hasLogs = false;
        let output = () => {
            let outStr = `${CONTEXT_SEPARATOR}\n${MakeFontTag(LOG_WARN)}Begin Log[${logID}] - {${context.logLevel}}</font>\n`;
            for (let settingID in LOGGER_SETTINGS) {
                if (!queues[settingID] || queues[settingID].length == 0) {
                    continue;
                }

                outStr += MakeFontTag(settingID as LogLevel);
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