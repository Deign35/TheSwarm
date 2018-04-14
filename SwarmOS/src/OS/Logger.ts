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

const ERROR_COLORS = {
    '5': '#ff0066',
    '4': '#e65c00',
    '3': '#809fff',
    '2': '#999999',
    '1': '#737373',
    '0': '#666666',
    'highlight': '#ffff00'
}

declare var Memory: any;
export class SwarmLogger {
    constructor() {
        this.defaultLogGroup = 'default'
    }
    private defaultLogGroup: string;

    log(message: string, severity: number = 3, group?: string, tags: string[] = []) {
        if (!group) {
            group = this.defaultLogGroup
        }

        if (group !== 'default') {
            message = `[${Game.shard.name}] ${group}: ${message}`
        } else {
            message = `[${Game.shard.name}] ${message}`
        }

        if (severity >= LOG_ERROR) {
            qlib.notify.send(message, 500)
        }

        if (Memory.loglevel && Memory.loglevel > severity) {
            return
        }

        let attributes = ''
        let tag
        if (tags) {
            for (tag in tags) { // jshint ignore:line
                attributes += ` ${tag}="${tags[tag]}"`
            }
        }
        attributes += ` group="${group}"`
        attributes += ` severity="${severity}"`
        attributes += ` tick="${Game.time}"`
        message = `<font color="${ERROR_COLORS[severity]}"${attributes}>${message}</font>`
        console.log(message)
    }

    logData(data, severity, group) {
        try {
            this.log(JSON.stringify(data), severity, group)
        } catch (err) {
            this.log('Unable to log data due to circular dependency', severity, group)
        }
    }

    highlight(message) {
        return this.log(message, 'highlight', false, {
            'type': 'highlight'
        })
    }

    highlightData(data) {
        return this.highlight(JSON.stringify(data))
    }
}