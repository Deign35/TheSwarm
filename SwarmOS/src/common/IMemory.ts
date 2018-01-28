/// <reference path='./IDisposable.ts' />
export class IMemory extends IDisposable {
    readonly MemoryId: string;
    constructor(memId: string) {
        super();
        this.MemoryId = memId;
    };
    Load() { console.log('Load'); };
    Save() { console.log('Save'); };
} global['IMemory'] = IMemory;