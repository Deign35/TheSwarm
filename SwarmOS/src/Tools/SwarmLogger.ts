/**
 * Initial commit was copied from 
 * https://github.com/ScreepsQuorum/screeps-quorum/tree/7254e727868fdc30e93b4e4dc8e015021d08a6ef
 * 
 */
global.LOG_ALERT = 6;
global.LOG_FATAL = 5
global.LOG_ERROR = 4
global.LOG_WARN = 3
global.LOG_INFO = 2
global.LOG_DEBUG = 1
global.LOG_TRACE = 0

const ERROR_COLORS = [
    '#666666', // Trace - Dark grey
    '#00C6B6', // Debug - Teal
    '#FFFFFF', // Info - White
    '#F4D000', // Warn - Yellow
    '#e65c00', // Error - Red
    '#ff0066', // Fatal - Fuscia(sp?)
    '#C050E1', // Alert - Purple
];
interface Context {
    logLevel: number,
    logs: {
        [id: number]: (string | (() => string))[]
    }
}

const DEFAULT_LOG_LEVEL = Game.rooms['sim'] ? LOG_TRACE : LOG_INFO;
const DEFAULT_LOG_ID = 'SwarmOS';
export class SwarmLogger implements ILogger {
    CreateLogContext(context: LogContext): void {
        if (!this.logContexts[context.logID]) {
            this.logContexts[context.logID] = {
                logLevel: context.logLevel,
                logs: []
            }
        }
    }
    constructor() {
        this.logContexts = {};
        this.InitQueue();
    }
    trace(message: (string | (() => string)), contextID?: string) { return this.log(message, contextID, LOG_TRACE); }
    debug(message: (string | (() => string)), contextID?: string) { return this.log(message, contextID, LOG_DEBUG); }
    info(message: (string | (() => string)), contextID?: string) { return this.log(message, contextID, LOG_INFO); }
    warn(message: (string | (() => string)), contextID?: string) { return this.log(message, contextID, LOG_WARN); }
    error(message: (string | (() => string)), contextID?: string) { return this.log(message, contextID, LOG_ERROR); }
    fatal(message: (string | (() => string)), contextID?: string) { return this.log(message, contextID, LOG_FATAL); }
    alert(message: (string | (() => string)), contextID?: string) { return this.log(message, contextID, LOG_ALERT); }

    private logContexts: IDictionary<Context>;
    protected log(message: (string | (() => string)), contextID: string = DEFAULT_LOG_ID, severity: number = 3) {
        let context = this.logContexts[contextID];
        if (!context) {
            this.CreateLogContext({ logID: contextID, logLevel: DEFAULT_LOG_LEVEL });
            context = this.logContexts[contextID];
        }
        if (context.logLevel > severity) {
            return;
        }
        if (!context.logs[severity]) {
            context.logs[severity] = [];
        }
        context.logs[severity].push(message);
    }
    OutputLog(): void {
        let logOutputs = [];
        let ids = Object.keys(this.logContexts);
        for (let i = 0, length = ids.length; i < length; i++) {
            let context = this.logContexts[ids[i]];
            let log = this.compileLog(ids[i], context);

            if (log) {
                logOutputs.push(log);
            }
        }
        let startLoggingTime = Game.cpu.getUsed();
        let introStr = `<font color="${ERROR_COLORS[LOG_ALERT]}">Begin SwarmOS Log - t${Game.time}\n`
        introStr += `CPU: (${startLoggingTime}\/${Game.cpu.tickLimit}\/${Game.cpu.bucket})</font>\n`;

        console.log(introStr);
        for (let i = 0; i < logOutputs.length; i++) {
            console.log(logOutputs[i]);
        }

        this.InitQueue();
        console.log(`End Logging(${Game.cpu.getUsed() - startLoggingTime})`);
    }

    private compileLog(logID: string, context: Context) {
        let queues = context.logs;
        let hasLogs = false;
        let output = () => {
            let outStr = `<font color="${ERROR_COLORS[0]}">Begin Log[${logID}] - {${context.logLevel}}</font>\n`;
            for (let i = ERROR_COLORS.length - 1; i >= 0; i--) {
                if (!queues[i] || queues[i].length == 0) {
                    continue;
                }
                outStr += `<font color="${ERROR_COLORS[i]}">`
                while (queues[i].length > 0) {
                    let nextMessage = queues[i].shift();
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
            return outStr;
        }

        let compiledLog = output();
        return hasLogs ? compiledLog : undefined;
    }

    protected InitQueue(): void {
        let ids = Object.keys(this.logContexts);
        for (let i = 0, length = ids.length; i < length; i++) {
            this.logContexts[ids[i]].logs = {};
        }

        if (!this.logContexts[DEFAULT_LOG_ID]) {
            this.CreateLogContext({ logID: DEFAULT_LOG_ID, logLevel: DEFAULT_LOG_LEVEL });
        }
    }
}