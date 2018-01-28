import * as _ from "lodash";
import { RoleDeliverer } from './deliverer';

export class RoleSweeper {
    static roleId = "sweeper";
    static minBody = [MOVE, CARRY];
    static desiredBody = [MOVE, MOVE, MOVE, MOVE, CARRY, CARRY, CARRY, CARRY,
        MOVE, MOVE, MOVE, MOVE, CARRY, CARRY, CARRY, CARRY];
    static maxWorkers = 1;
    static terminal = Game.getObjectById('5a4b9b45a26e0858b28160a8') as StructureTerminal;
    static GetSpawner() {
        return 'Spawn1';
    }
    static run(creep: Creep) {
        let hr = 0;
        let creepCarryAmount = creep.carry.energy || 0;
        for(let rType in creep.carry) {
            creepCarryAmount += (creep.carry as { [resourceType: string]: any})[rType];
        }

        if(creep.memory['pickingUp'] && creepCarryAmount == creep.carryCapacity) {
            delete creep.memory['pickingUp'];
        }
        if(!creep.memory['pickingUp'] && creepCarryAmount == 0) {
            creep.memory['pickingUp'] = true;
        }

        if(creep.memory['pickingUp']) {
            let target = Game.getObjectById(creep.memory['DRTarget']);
            if(!target) {
                let allDroppedResources = creep.room.find(FIND_DROPPED_RESOURCES);
                if(!target) {
                    if(creepCarryAmount > 0) { delete creep.memory['pickingUp']};
                    if (!(creep.pos.x == 19 && creep.pos.y == 18)) {
                        return creep.moveTo(19, 18);
                    }
                } if(allDroppedResources.length == 1) {
                    target = allDroppedResources[0];
                } else if(allDroppedResources.length > 1) {
                    target = creep.pos.findClosestByPath(allDroppedResources, {
                        filter: function(drRes : Resource) {
                            return drRes.amount < creep.carryCapacity - creepCarryAmount;
                        }
                    });
                }

                hr = creep.pickup(target as Resource);
                if(hr == ERR_NOT_IN_RANGE){
                    hr = creep.moveTo(target as Resource);
                }
            }
        } else {
            RoleDeliverer.run(creep);
        }
        return hr;
    }
}