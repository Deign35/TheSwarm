import { SwarmQueen } from 'Managers/SwarmQueen';
import { SwarmReturnCode } from 'SwarmEnums';

export const loop = function () {
    if(initSwarm() != OK) {
        console.log('CATASTROPHIC END!!!!!!');
        return;
    }
    for(let name in Memory.creeps) {
        if(!Game.creeps[name]) {
            delete Memory.creeps[name];
        }
    } // Temp solution
    let swarmQueen = SwarmQueen.LoadSwarmData();
    swarmQueen.Activate();
    swarmQueen.Save();
}

const initSwarm = function() {
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