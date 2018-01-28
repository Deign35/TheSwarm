import { MemoryBase } from '../common/MemoryBase';

export class SwarmOverlord {
    static SaveData(dataObj: MemoryBase) {
        Memory.OverlordMemory[dataObj.MemoryId] = dataObj;
    }
    static LoadData(id: string) {
        return Memory.OverlordMemory[id];
    }

    private static InitOverlord() {
        console.log('InitOverlord');
        Memory.RESET = true;
        let initResult = OK;
        let startInit = Game.cpu.getUsed();

        Memory.DataDump = [];
        Memory.OverlordMemory = {};

        // Load managers here

        if(initResult != OK) {
            Memory.RESET = true;
            delete Memory.OverlordMemory;
        }

        console.log('Reset Overmind Completed[' + initResult + '] in ' + (Game.cpu.getUsed() - startInit) + ' ticks.');
        return initResult;
    }
    constructor () {
        if(!Memory.OverlordMemory || Memory.RESET) {
            SwarmOverlord.InitOverlord();
        }
    }
} global['SwarmOverlord'] = new SwarmOverlord() && SwarmOverlord;