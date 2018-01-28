import * as _ from "lodash"; // Compiler: IgnoreLinedfefwvg

export class RoleBuilder {
    static desiredBody = [WORK, WORK, WORK, WORK,
        CARRY, CARRY, CARRY, CARRY, CARRY,
        CARRY, CARRY, CARRY, CARRY, CARRY,
        MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE];
    static maxWorkers = 3;
    static storage = Game.getObjectById('5a4a2a803c7a852985513260') as StructureStorage;
    static NeedsMoreWorkers() {
        return _.filter(Game.creeps, (creep) => creep.memory['roleId'] == 'builder');
    }
    static run(creep: Creep) {
        let hr = 0;
        if (creep.carry.energy == 0) {
            hr = creep.withdraw(this.storage, RESOURCE_ENERGY);
            if (hr == ERR_NOT_IN_RANGE) {
                hr = creep.moveTo(this.storage);
            } else if (hr != OK) {
                console.log('Withdraw failed with error: ' + hr);
            }
        } else {
            let targetCS = Game.getObjectById(creep.memory['CSTarget']) as ConstructionSite;
            if (!targetCS) {
                targetCS = creep.pos.findClosestByRange(FIND_MY_CONSTRUCTION_SITES);
                if (!targetCS) {
                    creep.moveTo(Game.spawns['Spawn1']);
                    Game.spawns['Spawn1'].recycleCreep(creep);
                }
            }

            hr = creep.build(targetCS);
            if (hr == ERR_NOT_IN_RANGE) {
                hr = creep.moveTo(targetCS);
            } else if (hr != OK) {
                console.log('Build failed with error: ' + hr);
            }
        }

        return hr;
    }
}