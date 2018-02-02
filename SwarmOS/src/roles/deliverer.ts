import * as _ from "lodash";

export class RoleDeliverer {
    static roleId = "harvester3";
    static minBody = [MOVE, CARRY]
    static desiredBody = [MOVE, MOVE, MOVE, MOVE, CARRY, CARRY, CARRY, CARRY,
        MOVE, MOVE, MOVE, MOVE, CARRY, CARRY, CARRY, CARRY]; // TODO
    static maxWorkers = 2;

    static terminal = Game.getObjectById('5a4b9b45a26e0858b28160a8') as StructureTerminal;
    static storage = Game.getObjectById('5a4a2a803c7a852985513260') as StructureStorage;
    static link = Game.getObjectById('5a49dd7442f5c9030aa46389') as StructureLink;

    static GetTarget(creep: Creep) {
        if (creep.memory['delivering'] && creep.carry.energy == 0) {
            delete creep.memory['delivering'];
            delete creep.memory['movePath'];
            delete creep.memory['DelTar'];
        }

        let target: RoomObject = this.link;
        if(creep.carry.energy != 0) {
            if(this.terminal.store.energy < 100000) {
                target = this.terminal;
            } else {
                target = this.storage;
            }
        }

        return target;
    }

    static run(creep: Creep) {
        let hr = 0;
        let creepCarryAmount = creep.carry.energy || 0;
        let deliveryType: ResourceConstant = RESOURCE_ENERGY;
        let target = this.GetTarget(creep);
        for(let rType in creep.carry) {
            if(rType != RESOURCE_ENERGY) {
                creepCarryAmount += (creep.carry as { [resourceType: string]: any})[rType];
                deliveryType = rType as ResourceConstant;
            }
        }

        if (creepCarryAmount == 0) {
            hr = creep.withdraw(target, RESOURCE_ENERGY);
            if(hr == OK) {
                creep.memory['delivering'] = true;
            }
        } else {
            hr = creep.transfer(target, deliveryType);
        }
        return hr;
    }
}