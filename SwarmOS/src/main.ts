export const loop = function () {
    let creepCount = 0;

    for (let name in Memory.creeps) {
        let creep = Game.creeps[name];
        if (!creep) { delete Memory.creeps[name]; continue; }

        creepCount++;
        let creepMemory = Memory.creeps[name];
        console.log('creepMemory: ' + JSON.stringify(creepMemory));
    }
    if (creepCount < 1) {
        //try spawn
        if (Game.spawns['Spawn1'].spawnCreep([MOVE], "" + Game.time, { dryRun: true }) == OK) {
            Game.spawns['Spawn1'].spawnCreep([MOVE], "" + Game.time, { memory: { task: false } });
        }
    }
}