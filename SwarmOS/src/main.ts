import { IMemory } from './common/IMemory';

const TASK = 'task';
export const loop = function () {
    let creepCount = 0;

    for (let name in Memory.creeps) {
        let creep = Game.creeps[name];
        if (!creep) { delete Memory.creeps[name]; continue; }

        creepCount++;
        let creepMemory = Memory.creeps[name];
        console.log('creepMemory: ' + JSON.stringify(creepMemory));
    }
    if (creepCount < 5) {
        //try spawn
        if (Game.spawns['Spawn1'].spawnCreep([WORK, MOVE, CARRY], "" + Game.time, { dryRun: true }) == OK) {
            Game.spawns['Spawn1'].spawnCreep([WORK, MOVE, CARRY], "" + Game.time, { memory: { task: false } });
        }
    }
}