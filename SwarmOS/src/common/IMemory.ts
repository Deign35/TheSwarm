import { IDisposable } from './IDisposable';
export class IMemory extends IDisposable {
    readonly MemoryId: string;
    constructor(memId: string) {
        super();
        this.MemoryId = memId;
    };
    Load() { console.log('Load'); };
    Save() { console.log('Save'); };
}