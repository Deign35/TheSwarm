import * as SwarmCodes from 'Consts/SwarmCodes';
import { SwarmQueen } from 'Queens/SwarmQueen';

export const loop = function () {
    if (initSwarm() != SwarmCodes.C_NONE) {
        console.log('CATASTROPHIC END!!!!!!');
        return;
    }
    for (let name in Memory.creeps) {
        if (!Game.creeps[name]) {
            delete Memory.creeps[name];
        }
    } // Temp solution

    let swarmQueen = SwarmQueen.LoadSwarmData();
    swarmQueen.Activate();
    swarmQueen.Save();

    /*let hostiles = Game.rooms['E44S1'].find(FIND_HOSTILE_CREEPS);
    if (hostiles.length > 0) {
        Game.getObjectById('5a8cc4e55415643b964b2e2e').attack(hostiles[0]);
    }
    Game.rooms['E44S1'].visual.text(("CPU: " + Game.cpu.getUsed()).slice(0, 10), 21, 20.5, { color: 'black', backgroundColor: 'white', font: 0.8 })
    Game.rooms['E44S1'].visual.text(("MEM: " + RawMemory.get().length).slice(0, 10), 21, 21.5, { color: 'black', backgroundColor: 'white', font: 0.8 })
    Game.rooms['E44S1'].visual.text(("B: " + Game.cpu.bucket), 21, 22.5, { color: 'black', backgroundColor: 'white', font: 0.8 })*/

}

const initSwarm = function () {
    let initResult = SwarmCodes.C_NONE;
    if (!Memory.INIT) { // I want these gone at some point.
        console.log('InitSwarmlord');
        for (let name in Memory) {
            //if(name == 'creeps' || name == 'flags' || name == 'rooms' || name == 'spawns') { continue; }
            delete Memory[name];
        }
        let startInit = Game.cpu.getUsed();

        // Load managers here
        SwarmQueen.InitializeSwarm();

        if (initResult == SwarmCodes.C_NONE) {
            Memory.INIT = true;
        }
        console.log('Reset Swarmlord Completed[' + initResult + '] in ' + (Game.cpu.getUsed() - startInit) + ' cpu cycles.');
    }
    return initResult;
}