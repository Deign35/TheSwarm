/**
 * Initial commit was copied from 
 * https://github.com/ScreepsQuorum/screeps-quorum/tree/7254e727868fdc30e93b4e4dc8e015021d08a6ef
 * 
 */

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
    '#666666',
    '#737373',
    '#999999',
    '#809fff',
    '#e65c00',
    '#ff0066',
];

declare var Memory: any;
export class Logger {
    log(message: string, severity: number = 3) {//, tags?: { [id: string]: any }) {
        if (Memory.loglevel && Memory.loglevel > severity) {
            return
        }

        //message = `[${severity}] ${message}`
        let attributes = ''
        /*let tag
        if (tags) {
            for (tag in tags) { // jshint ignore:line
                attributes += ` ${tag}="${tags[tag]}"`
            }
        }*/
        attributes += ` severity="${severity}"`
        attributes += ` tick="${Game.time}"`
        message = `<font color="${ERROR_COLORS[severity]}"${attributes}>${message}</font>`
        console.log(message)
    }

    logData(data: any, severity: number) {
        try {
            this.log(JSON.stringify(data), severity)
        } catch (err) {
            this.log('Unable to log data due to circular dependency', severity)
        }
    }
}

global['Logger'] = new Logger();