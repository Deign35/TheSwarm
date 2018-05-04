/**
 * Initial commit was copied from 
 * https://github.com/ScreepsQuorum/screeps-quorum/tree/7254e727868fdc30e93b4e4dc8e015021d08a6ef
 * 
 */

export function InitOSHandler() {
    if (!global.sos) {
        global.sos = {};
        let target = {};
        let handler = {
            get(target: any, key: any, receiver: any) {
                var classname = 'sos_lib_' + key;
                if (!!SOS_LIB_PREFIX) {
                    classname = SOS_LIB_PREFIX + classname;
                }
                if (!target[classname]) {
                    target[classname] = require(classname);
                }
                return target[classname];
            }
        }
        global.sos.lib = new Proxy({}, handler);
    }
}