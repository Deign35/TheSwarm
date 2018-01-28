export class RoleDeliverer {
    static desiredBody = [MOVE, MOVE, MOVE, MOVE, CARRY, CARRY, CARRY, CARRY,
        MOVE, MOVE, MOVE, MOVE, CARRY, CARRY, CARRY, CARRY];
    static maxWorkers = 2;

    static terminal = Game.getObjectById('5a4b9b45a26e0858b28160a8') as StructureTerminal;
    static storage = Game.getObjectById('5a4a2a803c7a852985513260') as StructureStorage;
    static link = Game.getObjectById('5a49dd7442f5c9030aa46389') as StructureLink;
    static run(creep: Creep) {
        let hr = 0;
        if (creep.carry.energy == 0) {
            hr = creep.withdraw(this.link, RESOURCE_ENERGY);
            if (hr == ERR_NOT_IN_RANGE) {
                hr = creep.moveTo(this.link);
            } else if (hr != OK) {
                console.log('Withdraw failed with error: ' + hr);
            }
        } else {
            let target = this.storage as Structure;
            if (this.terminal.store[RESOURCE_ENERGY] < 100000) {
                target = this.terminal;
            }
            hr = creep.transfer(target, RESOURCE_ENERGY);
            if (hr == ERR_NOT_IN_RANGE) {
                hr = creep.moveTo(target);
            } else if (hr != OK) {
                console.log('transfer failed with error: ' + hr);
            }
        }
        return hr;
    }
}