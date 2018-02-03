import { SwarmMemory } from "Memory/SwarmMemory";
import { SwarmQueen } from "Managers/SwarmQueen";

const MEMORY_ID = 'Swarmlord';
export class Swarmlord extends SwarmMemory {
    private static _instance: Swarmlord;
    private SavedMemory: { [name: string]: IMemory };

    Save() {
        let memoryIDs = [];
        for (let name in this.SavedMemory) {
            this.SavedMemory[name].Save();
            memoryIDs.push(name);
        }
        this.SetData('MemoryIDs', memoryIDs);
        super.Save();
    }

    Load() {
        super.Load();
        this.SavedMemory = {};
        let memoryIDs = this.GetData('MemoryIDs') || [] as string[];
        for (let i = 0, length = memoryIDs.length; i < length; i++) {
            this.SavedMemory[memoryIDs[i]] = new SwarmMemory(memoryIDs[i]);
        }
    }

    static GetData(name: string) {
        return this._instance.SavedMemory[name];
    }
    static SetData(data: IMemory) {
        this._instance.SavedMemory[data.MemoryID] = data;
    }

    static SaveSwarmlord() {
        this._instance.Save();
    }

    static InitSwarmlord() {
        let initResult = OK as SwarmReturnCode;
        this._instance = new Swarmlord(MEMORY_ID);
        if (!Memory.INIT) { // I want these gone at some point.
            console.log('InitSwarmlord');
            for (let name in Memory) {
                delete Memory[name];
            }
            initResult = ERR_NOT_FOUND;
            this._instance.Save();
            this._instance.Load();
            // Delete? this._instance.SetData('MemoryIDs', [])
            let startInit = Game.cpu.getUsed();
            Memory.DataDump = [];

            // Load managers here
            initResult = SwarmQueen.InitializeSwarm();

            if (initResult == OK) {
                Memory.INIT = true;
            }

            this._instance.Save();
            this._instance.Load();
            console.log('Reset Swarmlord Completed[' + initResult + '] in ' + (Game.cpu.getUsed() - startInit) + ' cpu cycles.');
        }
        return initResult;
    }
}
global[MEMORY_ID] = Swarmlord;