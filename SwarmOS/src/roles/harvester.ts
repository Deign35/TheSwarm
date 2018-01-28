export class RoleHarvester {
    static roleId = "harvester";
    static minBody = [WORK, MOVE, CARRY];
    static desiredBody = [WORK, MOVE, CARRY, MOVE, CARRY, //W + 2M + 2C -- 100
        MOVE, WORK, WORK, MOVE, WORK, // 3W + 2M
        CARRY, MOVE, WORK, WORK, MOVE, // 2W + 2M + 1C -- 150
        WORK, CARRY, MOVE, CARRY, CARRY, // 1W + 1M + 3C -- 300
        CARRY, CARRY, MOVE, CARRY, CARRY]; // 1M + 4C -- 500

    static maxWorkers = 1;
    static source = Game.getObjectById('5982ff46b097071b4adc2586') as Source;

    static GetSpawner() {
        return 'Spawn1';
    }

    static run(creep: Creep) {
        let hr = 0;
        if (creep.memory['harvesting'] &&
            (this.source.energy == 0 || creep.carry.energy == creep.carryCapacity)) {
            delete creep.memory['harvesting'];
        }
        if (!creep.memory['harvesting'] && creep.carry.energy == 0) {
            creep.memory['harvesting'] = true;
        }

        if (creep.memory['harvesting']) {
            hr = this.harvest(creep, this.source);
        } else {
            hr = this.deliver(creep);
        }
        return hr;
    }

    private static harvest(creep: Creep, source: Source) {
        let hr = 0;

        hr = creep.harvest(source);
        if (hr == ERR_NOT_IN_RANGE) {
            hr = creep.moveTo(source);
        } else if (hr != OK) {
            console.log('Harvest failed with error: ' + hr);
        }

        return hr;
    }
    private static deliver(creep: Creep) {
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

    private static findDeliveryTarget(creep: Creep) {
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