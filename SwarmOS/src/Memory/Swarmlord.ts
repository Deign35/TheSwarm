import { profile } from "Tools/Profiler";
import { NotImplementedException, SwarmException, MemoryNotFoundException, AlreadyExistsException } from "Tools/SwarmExceptions";
import { StorageMemory, CreepMemory, ConsulMemory, FlagMemory, RoomMemory, StructureMemory, BasicMemory } from "Memory/StorageMemory";

declare var Memory: StorageMemoryStructure;
var deserializedMemory = JSON.parse(JSON.stringify(Memory)) as StorageMemoryStructure;
var cachedMemory = {} as CacheMemoryStructure;

function ConvertDataToMemory(id: string, path: string[], data: any): StorageMemory {
    let memoryType = data[MEM_TYPE] as StorageMemoryType;
    switch (memoryType) {
        case (StorageMemoryType.Creep): return new CreepMemory(id, path, data);
        case (StorageMemoryType.Consul): return new ConsulMemory(id, path, data);
        case (StorageMemoryType.Flag): return new FlagMemory(id, path, data);
        case (StorageMemoryType.Room): return new RoomMemory(id, path, data);
        case (StorageMemoryType.Structure): return new StructureMemory(id, path, data);
    }

    return new BasicMemory(id, path, data);
}

@profile
export class Swarmlord implements ISwarmlord {
    constructor() {
        this.InitializeMemory();
    }

    private storageMemory!: { [storagePath: string]: IStorageMemory }
    InitializeMemory() {
        if (!deserializedMemory.INIT) {
            // init stuff
            Memory = {
                creeps: {},
                flags: {},
                structures: {},
                rooms: {},
                INIT: true
            };
        }
    }

    CreateNewStorageMemory(id: string, path: string[], memType: StorageMemoryType): void {
        let mem = ConvertDataToMemory(id, path, {});
        let targetObject = deserializedMemory;
        for (let i = 0; i < path.length; i++) {
            targetObject = targetObject[path[i]];
            if (!targetObject) {
                let targetObject = this.CreateNewStorageMemory(path[i], path.slice(0, i - 1), StorageMemoryType.None);
            }
        }
        if (targetObject[id]) {
            throw new AlreadyExistsException("CreateNewStorageMemory(" + id + ", " + JSON.stringify(path) + ", " + memType + ")");
        }
        targetObject[id] = mem;
    }

    CheckoutMemory(id: string, path: string[]) {
        let storagePath = this.MakeStoragePath(id, path);
        if (!this.storageMemory[storagePath]) {
            
        }

        

        return this.storageMemory[storagePath];
    }

    private MakeStoragePath(id: string, path: string[]) {
        let storagePath = "";
        for (let i = 0; i < path.length; i++) {
            storagePath += path[i] + '_';
        }
        storagePath += id;

        return storagePath;
    }
}

global['Swarmlord'] = new Swarmlord();