import { SwarmQueen } from 'Managers/SwarmQueen';
import { SwarmReturnCode } from 'SwarmEnums';
import './Commands/ConsoleCommands';
import './Commands/GenericRoles';

export const loop = function () {
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
        Memory.DataDump = [];
        Memory.TargetData = {};
        Memory.TargetFactor = {};
        Memory.TargetMax = {};
        Memory['lordCount'] = 0;

        if (initResult == OK) {
            Memory.INIT = true;
        }
        console.log('Reset Swarmlord Completed[' + initResult + '] in ' + (Game.cpu.getUsed() - startInit) + ' cpu cycles.');
    }
    return initResult;
}

/*

    let room = Game.rooms['W2N5'];
    if(room.energyCapacityAvailable >= 1300 && !Memory['Triggered']) {
        Memory['Triggered'] = true;
        CC.EZUpdate('W2N5', {work:8, carry:4, move:6});
    }
    if(room.energyCapacityAvailable >= 2000 && !Memory['Triggered2']) {
        Memory['Triggered2'] = true;
        CC.EZUpdate('W2N5', {work:5, carry:2, move:3});
        GR.CreateGenPurposeJob('W2N5', {work:10, carry:6, move:8});
        GR.CreateGenPurposeJob('W2N5', {work:5, carry:3, move:4});
        GR.CreateGenPurposeJob('W2N5', {work:5, carry:3, move:4});
    }
    if(room.controller.progress < 100) {
        if(Memory['CurRCL'] != room.controller.level && !Memory['Triggered']) {
            if(room.controller.level == 3) {
                CC.EZUpdate('W2N5', {move:2, carry:1, work:3})
            } else if(room.controller.level == 4) {
                CC.EZUpdate('W2N5', {move:4, carry:2, work:4})
            }

            Memory['CurRCL'] = room.controller.level;
        }
        let flags = room.find(FIND_FLAGS);
        for(let i = 0; i < flags.length; i++) {
            room.createConstructionSite(flags[i].pos, STRUCTURE_EXTENSION);
            flags[i].remove();
        }
    }
*/