/**
 * Initial commit was copied from 
 * https://github.com/ScreepsQuorum/screeps-quorum/tree/7254e727868fdc30e93b4e4dc8e015021d08a6ef
 * 
 */
export function getTickRate() {
    if (!Memory.sos.tickrate.stick || !Memory.sos.tickrate.stime) {
        resetTickTracker()
    }

    var ticks = Game.time - Memory.sos.tickrate.stick
    var seconds = Math.floor(Date.now() / 1000) - Memory.sos.tickrate.stime
    var tickrate = (seconds / ticks).toFixed(4)

    // After tracking for long enough save result and reset data
    if (Game.time - Memory.sos.tickrate.stick > 500) {
        Memory.sos.tickrate.rate = tickrate
        resetTickTracker()
    }

    // If saved tickrate is available use it, otherwise use calculated
    return !!Memory.sos.tickrate.rate ? Memory.sos.tickrate.rate : tickrate
}

export function resetTickTracker() {
    if (!Memory.sos) {
        Memory.sos = {}
    }
    if (!Memory.sos.tickrate) {
        Memory.sos.tickrate = {}
    }
    Memory.sos.tickrate.stick = Game.time
    Memory.sos.tickrate.stime = Math.floor(Date.now() / 1000)
}