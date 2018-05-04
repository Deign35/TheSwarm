/**
 * Initial commit was copied from 
 * https://github.com/ScreepsQuorum/screeps-quorum/tree/7254e727868fdc30e93b4e4dc8e015021d08a6ef
 * 
 */

export function counterGet(group: string) {
    if (!Memory.sos.counter[group]) {
        Memory.sos.counter[group] = 1
    } else {
        Memory.sos.counter[group]++
    }

    return Memory.sos.counter[group]
}

export function counterSet(group: string, value: number) {
    Memory.sos.counter[group] = value
    return value
}

export function counterReset(group: string) {
    if (Memory.sos.counter[group]) {
        delete Memory.sos.counter[group]
    }
}