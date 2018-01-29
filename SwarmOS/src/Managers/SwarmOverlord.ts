import { SimpleMemory } from "Memory/MemoryBase";

export class SwarmOverlord extends SimpleMemory {
    private static _instance = new SwarmOverlord();
    static SaveData(id: string, dataObj: IMemory) {
        this._instance.SetData(id, dataObj);
    }
    static LoadData(id: string) {
        return this._instance.GetData(id);
    }

    private InitOverlord() {
        console.log('InitOverlord');
        Memory.RESET = true;
        let initResult = OK;
        let startInit = Game.cpu.getUsed();

        Memory.DataDump = [];
        Memory.OverlordMemory = {};

        // Load managers here

        if (initResult != OK) {
            Memory.RESET = true;
            delete Memory.OverlordMemory;
        }

        console.log('Reset Overmind Completed[' + initResult + '] in ' + (Game.cpu.getUsed() - startInit) + ' ticks.');
        return initResult;
    }
    constructor() { // Memory needs to be reorged a bit in here to utilize the base functionality.
        super('SwarmOverlord'); // There should be no other place where Memory is referenced, except in MemoryBase.
        if (!Memory.OverlordMemory || Memory.RESET) {
            this.InitOverlord();
        }
    }
} global['SwarmOverlord'] = new SwarmOverlord() && SwarmOverlord;