/**
 * Initial commit was copied from 
 * https://github.com/ScreepsQuorum/screeps-quorum/tree/7254e727868fdc30e93b4e4dc8e015021d08a6ef
 * 
 */

export function getLock(label: string, ttl: number = 20, id?: string) {
    if (!Memory.sos.lock[label] || parseInt(Memory.sos.lock[label].exp, 36) < Game.time) {
        if (!id) {
            id = sos.lib.uuid.vs()
        }
        Memory.sos.lock[label] = {
            id: id,
            expiresAt: (ttl + Game.time).toString(36)
        }
    }
    if (Memory.sos.lock[label].id !== id) {
        return false
    }
    return Memory.sos.lock[label].id
}

export function extendLock(label: string, id: string, ttl: number = 20) {
    if (!Memory.sos.lock[label]) {
        return false
    }
    if (Memory.sos.lock[label].id !== id) {
        return false
    }
    Memory.sos.lock[label].exp = (ttl + Game.time).toString(36)
    return Memory.sos.lock[label].id
}

export function clearLock(label: string) {
    if (Memory.sos.lock[label]) {
        delete Memory.sos.lock[label]
    }
}

export function cleanLocks() {
    let keys = Object.keys(Memory.sos.lock);
    for (let i = 0; i < keys.length; i++) {
        if (parseInt(Memory.sos.lock[keys[i]].exp, 36) > Game.time) {
            delete Memory.sos.lock[keys[i]]
        }
    }
}
