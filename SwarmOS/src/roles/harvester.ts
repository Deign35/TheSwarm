import { Role } from './roles';

export class RoleHarvester implements Role {
    desiredBody = [WORK, WORK, WORK, WORK, WORK, WORK, MOVE, CARRY];
    maxWorkers = 2;
    run(creep: Creep) {
        let hr = 0;
        let targetSource = Game.getObjectById(creep.memory['targetSource']) as Source;
        if (creep.memory['harvesting'] &&
            (targetSource.energy == 0 || creep.carry.energy == creep.carryCapacity)) {
            delete creep.memory['harvesting'];
        }
        if (!creep.memory['harvesting'] && creep.carry.energy == 0) {
            creep.memory['harvesting'] = true;
        }

        if (creep.memory['harvesting']) {
            hr = this.harvest(creep, targetSource);
        } else {
            hr = this.deliver(creep);
        }
        return hr;
    }

    private harvest(creep: Creep, source: Source) {
        let hr = 0;

        hr = creep.harvest(source);
        if (hr == ERR_NOT_IN_RANGE) {
            hr = creep.moveTo(source);
        } else if (hr != OK) {
            console.log('Harvest failed with error: ' + hr);
        }
        return hr;
    }
    private deliver(creep: Creep) {
        let hr = 0;

        let deliveryTarget: any = Game.getObjectById(creep.memory['delTar']);
        if (!deliveryTarget) {
            deliveryTarget = this.findDeliveryTarget(creep);
            if (!deliveryTarget) {
                return ERR_NOT_FOUND;
            }
        }

        hr = creep.transfer(deliveryTarget, RESOURCE_ENERGY);
        if (hr == ERR_NOT_IN_RANGE) {
            creep.moveTo(deliveryTarget);
        } else if (hr != OK) {
            console.log('Delivery failed with error: ' + hr);
        }
        return hr;
    }

    private findDeliveryTarget(creep: Creep) {
        let possibleTargets = creep.room.find(FIND_STRUCTURES, {
            filter(structure) {
                return (structure.structureType == STRUCTURE_EXTENSION ||
                    structure.structureType == STRUCTURE_SPAWN ||
                    structure.structureType == STRUCTURE_TOWER) &&
                    structure.energy <= structure.energyCapacity;
            }
        });

        if (possibleTargets.length == 0) {
            return undefined;
        }

        possibleTargets.sort((first: Structure, second: Structure) => {
            if (first.structureType == STRUCTURE_TOWER || second.structureType == STRUCTURE_TOWER) {
                return first.structureType == STRUCTURE_TOWER ? 1 : -1;
            }

            let dist1 = first.pos.getRangeTo(creep);
            let dist2 = second.pos.getRangeTo(creep);

            return (dist1 < dist2) ? -1 : (dist1 == dist2 ? 0 : -1);
        });


        return possibleTargets[0];
    }
}