import * as ScreepsPlus from './plugins/screepsPlus';
export const loop = function () {
    let creepCount = 0;

    const SPlus = new ScreepsPlus.ScreepsPlus();
    SPlus.AddStatsCallback('testFunc1', testFunc1);
    SPlus.AddStatsCallback('testFunc2', testFunc2);
    SPlus.AddStatsCallback('testFunc3', testFunc3);
    SPlus.CollectStats();
    /*for (let name in Memory.creeps) {
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
    }*/
}

let testFunc1 = function (stats: any) {
    console.log('stats1');
    console.log(JSON.stringify(stats));
}
let testFunc2 = function (stats: any) {
    console.log('stats2');
}
let testFunc3 = function (stats: any) {
    console.log('stats3');
}