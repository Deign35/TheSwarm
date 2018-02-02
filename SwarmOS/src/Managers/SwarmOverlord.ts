declare const SwarmMemoryName = 'SwarmOverlord'; // Maybe change this class to Swarmlord?
export class SwarmOverlord {
    private static _cache: Dictionary = {};
    static SaveData(id: string, dataObj: any) {
        this._cache[id] = dataObj;
    }
    static LoadData(id: string) {
        return this._cache.GetData(id);
    }

    static SaveSwarmOverlordData() {
        Memory[SwarmMemoryName] = this._cache; // There should be no other place where Memory is referenced
    }

    static InitOverlord() {
        let initResult = OK;
        if(!Memory.INIT) {
            console.log('InitOverlord');
            Memory.INIT = false; // There should be no other place where Memory is referenced
            let startInit = Game.cpu.getUsed();

            Memory[SwarmMemoryName] = {}; // There should be no other place where Memory is referenced
            Memory.DataDump = []; // There should be no other place where Memory is referenced

            // Load managers here

            if (initResult == OK) {
                Memory.INIT = true; // There should be no other place where Memory is referenced
            }

            console.log('Reset Overmind Completed[' + initResult + '] in ' + (Game.cpu.getUsed() - startInit) + ' cpu cycles.');
        } else {
            if(this._cache['LastTick'] && this._cache['LastTick'] + 1 != Game.time) {
                this._cache = Memory[SwarmMemoryName];
            }
        }
        Memory['LastTick'] = Game.time;
        this._cache['LastTick'] = Game.time;
        return initResult;
    }
} global[SwarmMemoryName] = SwarmOverlord;