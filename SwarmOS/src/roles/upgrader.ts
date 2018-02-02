export class RoleUpgrader {
    static roleId = "upgrader";
    static minBody = [WORK, MOVE, CARRY];
    static desiredBody = [WORK, MOVE, CARRY];
    static maxWorkers = 1;
    static link = Game.getObjectById('5a49dd7442f5c9030aa46389') as StructureLink;
    static run(creep: Creep) {
        if (!(creep.pos.x == 31 && creep.pos.y == 36)) {
            creep.moveTo(31, 36);
        } else {
            if (!creep.room.controller) { console.log('ok wtf'); return ERR_INVALID_TARGET; }
            if (creep.room.controller.ticksToDowngrade < 99800) {
                if (creep.carry[RESOURCE_ENERGY] == 0) {
                    creep.withdraw(this.link, RESOURCE_ENERGY, 1);
                } else {
                    creep.upgradeController(creep.room.controller);
                }
            }
        }

        return OK;
    }
}