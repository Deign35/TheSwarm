import * as _ from "lodash"; // Compiler: IgnoreLinedfefwvg

export class RoleBuilder {
    static desiredBody = [WORK, CARRY, MOVE];
    static maxWorkers = 1;
    static storage = Game.getObjectById('5a4a2a803c7a852985513260') as StructureStorage;
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
            let targetRD = Game.getObjectById(creep.memory['RDTarget']) as StructureRoad;
            if (!targetRD) {
                targetRD = creep.pos.findClosestByRange(FIND_STRUCTURES, {
                    filter: function (structure) {
                        return structure.structureType == STRUCTURE_ROAD &&
                            structure.hits < structure.hitsMax;
                    }
                }) as StructureRoad;
                if (!targetRD) { return ERR_NOT_FOUND; }
                creep.memory['RDTarget'] = targetRD.id;
            }

            hr = creep.repair(targetRD);
            if (hr == ERR_NOT_IN_RANGE) {
                hr = creep.moveTo(targetRD);
            } else if (hr != OK) {
                console.log('Repair failed with error: ' + hr);
            } else {
                delete creep.memory['RDTarget'];
            }
        }

        return hr;
    }
}