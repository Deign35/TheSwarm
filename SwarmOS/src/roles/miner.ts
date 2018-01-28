export class RoleMiner {
    static roleId = "miner";
    static desiredBody = [WORK, MOVE, CARRY, WORK, WORK, WORK, WORK,
        WORK, WORK, WORK, WORK, WORK,
        WORK, WORK, WORK, WORK, WORK,
        WORK, WORK, WORK, WORK, WORK, //20
        WORK, WORK, WORK, WORK, WORK,
        WORK, WORK, WORK, WORK, WORK, // 30w + 1c + 1m =
        WORK, WORK, WORK, WORK, WORK,
        WORK, WORK, MOVE, MOVE, MOVE]; // 40w
    static minBody = RoleMiner.desiredBody;
    static maxWorkers = 1;
    static extractor = Game.getObjectById('5a48e5c68d2a69512003ff0a') as StructureExtractor;
    static mineral = Game.getObjectById('598342f7641acf05735788d1') as Mineral;
    static storage = Game.getObjectById('5a4a2a803c7a852985513260') as StructureStorage;
    static terminal = Game.getObjectById('5a4b9b45a26e0858b28160a8') as StructureStorage;
    static GetSpawner() {
        return this.mineral.mineralAmount > 0 ? 'Spawn2' : undefined;
    }
    static run(creep: Creep) {
        let hr = 0;
        if (!(creep.pos.x == 46 && creep.pos.y == 43)) {
            creep.moveTo(46, 43);
        }
        hr = creep.harvest(this.mineral);
        hr = creep.transfer(this.terminal, RESOURCE_OXYGEN);
        return hr;
    }
}