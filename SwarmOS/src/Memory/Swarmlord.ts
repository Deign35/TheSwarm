import { profile } from "Tools/Profiler";
import * as StorageMemory from "Memory/StorageMemory";
import { NotImplementedException, SwarmException, MemoryNotFoundException } from "Tools/SwarmExceptions";

declare var Memory: StorageMemoryStructure;
var deserializedMemory = JSON.parse(JSON.stringify(Memory)) as StorageMemoryStructure;

@profile
export class Swarmlord implements ISwarmlord {
    constructor() {
        this.InitializeMemory();
    }

    private storageMemory!: { [id: string]: IStorageMemory }
    InitializeMemory() {
        if (!deserializedMemory.INIT) {

        }
    }

    SaveMemory(id: string, data: any, parentMemory: ISwarmMemory) {

    }

    CheckoutMemory(id: string, path: string[]): IStorageMemory {
        let parentMem = this.ConvertPathToStorageMemory(path);
        if (parentMem) {

        }
    }

    CreateNewStorageMemory(id: string, path: string[], memType: StorageMemoryType): IStorageMemory {
        let parentMemory = this.ConvertPathToStorageMemory(path);
        parentMemory.SetData(id, {});
        let newMem: StorageMemory;
        switch (memType) {
            case (StorageMemoryType.Consul):
                newMem = new BasicStorageMemory(id, path);
            default:
                throw new NotImplementedException();
        }
        // newMem.Save();

        // newMem 

        return this.CheckoutMemory(id, path, memType);
    }

    protected ConvertPathToStorageMemory(path: string[]): IStorageMemory {
        let targetObj = deserializedMemory;
        while (path.length > 0) {
            let nextPath = path.shift();
            if (nextPath && targetObj[nextPath]) {
                targetObj = targetObj[nextPath];
            } else {
                throw new MemoryNotFoundException();
            }
        }

        return JSON.parse(JSON.stringify(targetObj)) as StorageMemory;
    }

    protected ConvertDataObjectToStorageMemory(memData: any, memType: StorageMemoryType) {
        switch (memType) {
            case (StorageMemoryType.Creep):
                return     
        }
    }
}

global['Swarmlord'] = new Swarmlord();