import { Delegate } from "common/Delegate";

export class SwarmMemory implements IMemory {
    protected _cache: Dictionary = {};
    constructor(public MemoryID: string, public Parent?: SwarmMemory) { this.Load(); }
    GetData(id: string) { return this._cache[id] || undefined; }
    SetData(id: string, data: any) { this._cache[id] = data; }

    Save() {
        if(this.Parent) {
            this.Parent.SetData(this.MemoryID, this._cache);
        } else {
            SwarmOverlord.SaveData(this.MemoryID, this._cache);
        }
    }

    Load() {
        if(this.Parent) {
            this._cache = this.Parent.GetData(this.MemoryID);
        } else {
            this._cache = SwarmOverlord.LoadData(this.MemoryID);
        }
    }
}

declare type MemFunc = (mem: SwarmMemory, name: string) => any;
const MemFunc = (mem: SwarmMemory, name: string) => {
    return mem.GetData(name);
}
export class CreepMemory extends SwarmMemory {
    CT: MemFunc = () => MemFunc(this, 'CommandTarget');
    GetCommandTarget() {
        return this.GetData('CommandTarget');
    }
    SetCommandTarget(target: RoomObject | RoomPosition) {
        this.SetData('CommandTarget', target);
    }
}