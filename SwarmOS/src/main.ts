require('globalConstants');
const prof = require('screeps-profiler');

import { SwarmStructure } from "Prototypes/SwarmStructure";

prof.enable();
export const loop = function () {
    prof.wrap(function () {
        initSwarm();
    });
}

let initSwarm = profiler.registerFN(function () {
    // const initSwarm = function() {
    for (let creepName in Game.creeps) {
        let creep = Game.creeps[creepName];
        if (creep.carry[RESOURCE_ENERGY] == creep.carryCapacity) {
            if (creep.upgradeController(creep.room.controller!) == ERR_NOT_IN_RANGE) {
                creep.moveTo(creep.room.controller!);
            }
        } else {
            let source = creep.room.find(FIND_SOURCES)[0] as Source;
            if (creep.harvest(source) == ERR_NOT_IN_RANGE) {
                creep.moveTo(source);
            }
        }
    }
}
    , "InitSwarm");