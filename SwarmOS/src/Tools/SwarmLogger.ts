/**
 * Initial commit was copied from 
 * https://github.com/ScreepsQuorum/screeps-quorum/tree/7254e727868fdc30e93b4e4dc8e015021d08a6ef
 * 
 */
declare const LOG_ALERT = 6;
global.LOG_ALERT = 6;
declare const LOG_FATAL = 5;
global.LOG_FATAL = 5
declare const LOG_ERROR = 4;
global.LOG_ERROR = 4
declare const LOG_WARN = 3;
global.LOG_WARN = 3
declare const LOG_INFO = 2;
global.LOG_INFO = 2
declare const LOG_DEBUG = 1;
global.LOG_DEBUG = 1
declare const LOG_TRACE = 0;
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

const MIN_LOG_LEVEL = LOG_INFO;
export class SwarmLogger {
    constructor() {
        this.InitQueue();
    }
    trace(message: (string | (() => string))) { return this.log(message, LOG_TRACE); }
    debug(message: (string | (() => string))) { return this.log(message, LOG_DEBUG); }
    info(message: (string | (() => string))) { return this.log(message, LOG_INFO); }
    warn(message: (string | (() => string))) { return this.log(message, LOG_WARN); }
    error(message: (string | (() => string))) { return this.log(message, LOG_ERROR); }
    fatal(message: (string | (() => string))) { return this.log(message, LOG_FATAL); }
    alert(message: (string | (() => string))) { return this.log(message, LOG_ALERT); }

    private log(message: (string | (() => string)), severity: number = 3) {
        if (MIN_LOG_LEVEL > severity) {
            return;
        }
        this.logQueue[severity].push(message);
    }

    OutputLog(): void {
        let queues = this.logQueue;
        let output = () => {
            let outStr = '';
            for (let i = queues.length - 1; i >= 0; i--) {
                if (queues[i].length == 0) {
                    continue;
                }
                outStr += `<font color="${ERROR_COLORS[i]}">Log[${i}] - ${queues[i].length} messages\n`
                while (queues[i].length > 0) {
                    let nextMessage = queues[i].shift();
                    if (nextMessage) {
                        if (typeof nextMessage === "function") {
                            nextMessage = nextMessage();
                        }
                        outStr += `${nextMessage}\n`;
                    }
                }
                outStr += `</font>`;
            }
            let introStr = `<font color="${ERROR_COLORS[LOG_INFO]}">Tick[${Game.time}] - CPU: (`
            introStr += `${Game.cpu.getUsed()}\/${Game.cpu.tickLimit}\/${Game.cpu.bucket})</font>\n`;
            return introStr + outStr;
        }

        console.log(output());
        this.InitQueue();
    }

    private InitQueue(): void {
        this.logQueue = [];
        for (let i = 0; i < ERROR_COLORS.length; i++) {
            this.logQueue.push([]);
        }
    }

    private logQueue!: (string | (() => string))[][];
}