export class RoleSweeper {
    static minBody = [MOVE, CARRY];
    static desiredBody = [MOVE, MOVE, MOVE, MOVE, CARRY, CARRY, CARRY, CARRY,
        MOVE, MOVE, MOVE, MOVE, CARRY, CARRY, CARRY, CARRY];
    static maxWorkers = 1;
    static source = Game.getObjectById('5982ff46b097071b4adc2587') as Source;
    static link = Game.getObjectById('5a3a668823a1f6774fc58ac3') as StructureLink;
    static run(creep: Creep) {
        let hr = 0;

        if (creep.carry.energy < creep.carryCapacity) {
            creep.harvest(this.source);
        }
        if (creep.carry.energy > 0) {
            creep.transfer(this.link, RESOURCE_ENERGY);
        }

        else {
            if (!(creep.pos.x == 19 && creep.pos.y == 18)) {
                creep.moveTo(19, 18);
            }
        }
        return hr;
    }
}