/// <reference path='./IDisposable.ts' />
export class IMemory extends IDisposable {
    readonly MemoryId: string;
    private MemoryObject: any = {};
    constructor(memId: string) {
        super();
        this.MemoryId = memId;
        this.MemoryObject = SwarmOverlord.LoadData(memId);
    };

    dispose() {
        SwarmOverlord.SaveData(this.MemoryObject);
    }
} global['IMemory'] = IMemory;