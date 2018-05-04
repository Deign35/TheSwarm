/**
 * Initial commit was copied from 
 * https://github.com/ScreepsQuorum/screeps-quorum/tree/7254e727868fdc30e93b4e4dc8e015021d08a6ef
 * 
 */
let shardid: number = 0;
if (Game.shard) {
    let matches = Game.shard.name.match(/\d+$/);
    if (matches) {
        shardid = parseInt(matches[0]);
    }
}
export const sos_lib_uuid = {
    index: 0,
    tick: Game.time,

    vs: function () {
        if (Game.time != this.tick) {
            this.index = 0
            this.tick = Game.time
        }
        this.index++
        var indexString = this.index.toString(36)
        if (indexString.length == 1) {
            indexString = '00' + indexString
        } else if (indexString.length == 2) {
            indexString = '0' + indexString
        }
        return shardid + Game.time.toString(36) + indexString;
    }
}