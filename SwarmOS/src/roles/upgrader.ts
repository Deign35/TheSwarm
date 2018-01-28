export class RoleHarvester2 {
    static minBody = [WORK, MOVE, CARRY];
    static desiredBody = [WORK, MOVE, CARRY];
    static maxWorkers = 1;
    static source = Game.getObjectById('5982ff46b097071b4adc2587') as Source;
    static link = Game.getObjectById('5a49dd7442f5c9030aa46389') as StructureLink;
    static run(creep: Creep) {
        let hr = 0;
        if (!(creep.pos.x == 31 && creep.pos.y == 36)) {
            creep.moveTo(31, 36);
        }
        if (!creep.room.controller) { console.log('ok wtf'); return ERR_INVALID_TARGET; }
        if (creep.room.controller.ticksToDowngrade < 99800) {
            if (creep.carry[RESOURCE_ENERGY] == 0) {
                hr = creep.withdraw(this.link, RESOURCE_ENERGY, 1);
            } else {
                hr = creep.upgradeController(creep.room.controller);
            }
        }

        return hr;
    }
}