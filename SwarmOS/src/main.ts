import { SwarmQueen } from 'Managers/SwarmQueen';
import { SwarmReturnCode } from 'SwarmEnums';

export const loop = function () {
    try {
        if (initSwarm() != OK) {
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
    } finally {
        DisposeAll();
    }

    /*let targets = Game.rooms['E9N35'].find(FIND_HOSTILE_CREEPS);
    if(targets.length > 0) {
        let tower = Game.getObjectById(Memory['TowerID']) as StructureTower;
        tower.attack(targets[0]);
    }
    Game.rooms['E9N35'].visual.text(("CPU: " + Game.cpu.getUsed()).slice(0, 10), 21, 20.5, {color:'black', backgroundColor: 'white', font: 0.8})
    Game.rooms['E9N35'].visual.text(("MEM: " + RawMemory.get().length).slice(0, 10), 21, 21.5, {color:'black', backgroundColor: 'white', font: 0.8})
    Game.rooms['E9N35'].visual.text(("B: " + Game.cpu.bucket), 21, 22.5, {color:'black', backgroundColor: 'white', font: 0.8})*/
}

const initSwarm = function () {
    let initResult = OK as SwarmReturnCode;
    if (!Memory.INIT) { // I want these gone at some point.
        console.log('InitSwarmlord');
        for (let name in Memory) {
            delete Memory[name];
        }
        initResult = ERR_NOT_FOUND;
        let startInit = Game.cpu.getUsed();

        // Load managers here
        initResult = SwarmQueen.InitializeSwarm();

        if (initResult == OK) {
            Memory.INIT = true;
        }
        console.log('Reset Swarmlord Completed[' + initResult + '] in ' + (Game.cpu.getUsed() - startInit) + ' cpu cycles.');
    }
    return initResult;
}