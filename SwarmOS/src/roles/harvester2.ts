export class RoleHarvester2 {
    static roleId = "harvester3";
    static minBody = [WORK, MOVE, CARRY];
    static desiredBody = [WORK, MOVE, CARRY, WORK, WORK, WORK, WORK, WORK];
    static maxWorkers = 1;
    static source = Game.getObjectById('5982ff46b097071b4adc2587') as Source;
    static link = Game.getObjectById('5a3a668823a1f6774fc58ac3') as StructureLink;
    static run(creep: Creep) {
        let hr = 0;
        if (!(creep.pos.x == 3 && creep.pos.y == 23)) {
            creep.moveTo(3, 23);
        }

        if (creep.carry.energy < creep.carryCapacity) {
            creep.harvest(this.source);
        }
        if (creep.carry.energy > 0) {
            creep.transfer(this.link, RESOURCE_ENERGY);
        }
        return hr;
    }
}