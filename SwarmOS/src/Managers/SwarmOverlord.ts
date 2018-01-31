import { SimpleMemory } from "Memory/MemoryWrappers";

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
        Memory.INIT = false;
        let initResult = OK;
        let startInit = Game.cpu.getUsed();

        Memory.DataDump = [];

        // Load managers here

        if (initResult == OK) {
            Memory.INIT = true;
        }

        console.log('Reset Overmind Completed[' + initResult + '] in ' + (Game.cpu.getUsed() - startInit) + ' cpu cycles.');
        return initResult;
    }
    constructor() { // Memory needs to be reorged a bit in here to utilize the base functionality.
        super('SwarmOverlord'); // There should be no other place where Memory is referenced, except in MemoryBase.
        if (!Memory.INIT) {
            this.InitOverlord();
        }
    }
} global['SwarmOverlord'] = new SwarmOverlord() && SwarmOverlord;