import * as _ from "lodash"; // Compiler: IgnoreLinedfefwvg

export class RoleRepairer {
    static roleId = "repairer";
    static desiredBody = [WORK, CARRY, MOVE];
    static maxWorkers = 1;
    static storage = Game.getObjectById('5a4a2a803c7a852985513260') as StructureStorage;

    static GetTarget(creep: Creep) {
        if (creep.memory['repairing'] && creep.carry.energy == 0) {
            delete creep.memory['repairing'];
            delete creep.memory['movePath'];
            delete creep.memory['RDTarget'];
        }

        let target: RoomObject = this.storage;
        if(creep.carry.energy != 0) {
            let targetRD = Game.getObjectById(creep.memory['RDTarget']) as StructureRoad;
            if (!targetRD) {
                targetRD = creep.pos.findClosestByRange(FIND_STRUCTURES, {
                    filter: function (structure) {
                        return structure.structureType == STRUCTURE_ROAD &&
                            structure.hits < structure.hitsMax;
                    }
                }) as StructureRoad;
                if (!targetRD) { return undefined; }
                creep.memory['RDTarget'] = targetRD.id;
            }
            target = targetRD;
        }

        return target;
    }
    static run(creep: Creep) {
        let hr = 0;
        let target = this.GetTarget(creep);
        if (creep.carry.energy == 0) {
            hr = creep.withdraw(target, RESOURCE_ENERGY);
            creep.memory['repairing'] = true;
        } else {
            if(target) {
                hr = creep.repair(target);
            } else {
                hr = OK;
            }
        }

        return hr;
    }
}