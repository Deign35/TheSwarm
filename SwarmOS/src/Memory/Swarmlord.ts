import { profile } from "Tools/Profiler";
import { NotImplementedException, SwarmException, MemoryNotFoundException, AlreadyExistsException } from "Tools/SwarmExceptions";
import { StorageMemory, CreepMemory, ConsulMemory, FlagMemory, RoomMemory, StructureMemory, BasicMemory } from "Memory/StorageMemory";
import { SwarmLogger } from "Tools/SwarmLogger";

declare var Memory: StorageMemoryStructure;
var deserializedMemory = JSON.parse(JSON.stringify(Memory)) as StorageMemoryStructure;
var cachedMemory = {} as CacheMemoryStructure;

function ConvertDataToMemory(id: string, path: string[], data: SwarmData): IStorageMemory {
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
        this.storageMemory = {};
    }

    private storageMemory: { [storagePath: string]: IStorageMemory }
    private InitializeMemory() {
        if (!deserializedMemory.INIT) {
            SwarmLogger.Log("Begin initialization of memory for entire Swarm");
            deserializedMemory = {
                creeps: {},
                flags: {},
                structures: {},
                rooms: {},
                profiler: Memory.profiler,
                INIT: true
            };
            // init stuff
            for (let id in Memory) {
                delete Memory[id];
            }
            for (let id in deserializedMemory) {
                Memory[id] = JSON.parse(JSON.stringify(deserializedMemory[id]));
            }
            SwarmLogger.Log("End initialization of memory");
        }
    }
    ValidateMemory() {
        if (!Memory.INIT) {
            global['Swarmlord'] = new Swarmlord();
        }
    }

    /**
     * @throws AlreadyExistsException
     */
    CreateNewStorageMemory(id: string, path: string[], memType: StorageMemoryType, data: any = {}): void {
        let mem = ConvertDataToMemory(id, path, data);
        let targetObject = deserializedMemory;
        for (let i = 0; i < path.length; i++) {
            if (!targetObject[path[i]]) {
                this.CreateNewStorageMemory(path[i], path.slice(0, i - 1), StorageMemoryType.None);
            }
            targetObject = targetObject[path[i]];
        }
        if (targetObject[id]) {
            throw new AlreadyExistsException("CreateNewStorageMemory(" + id + ", " + JSON.stringify(path) + ", " + memType + ")");
        }
        targetObject[id] = mem;
    }

    CheckoutMemory(id: string, path: string[]) {
        let storagePath = this.MakeStoragePath(id, path);
        if (!this.storageMemory[storagePath]) {
            // get it
        }

        let mem = this.storageMemory[storagePath];
        mem.ReserveMemory();

        return mem;
    }

    ReleaseMemory(mem: IStorageMemory, save: boolean = true) {
        let memPath = mem.SavePath; // Creates a copy each time, so just cache it now.
        let storagePath = this.MakeStoragePath(mem.id, memPath);
        if (!save) {
            // reload from the memory object
        } else {
            let parentMemory = this.LoadStorageMemory(memPath.slice(-1)[0], memPath.slice(0, -1));
            mem.SaveTo(parentMemory);
        }


    }

    /**
     * @throws AlreadyExistsException
     */
    private LoadStorageMemory(id: string, path: string[]) {
        let storagePath = this.MakeStoragePath(id, path);
        let parentObj: IStorageMemory;
        if (!this.storageMemory[storagePath]) {
            if (path.length == 0) {
                parentObj = this.LoadStorageFromMemory(id);
            } else {
                parentObj = this.LoadStorageMemory(path.slice(-1)[0], path.slice(0, -1));
            }

            this.storageMemory[storagePath] = parentObj[id];
        }

        return this.storageMemory[storagePath];
    }

    private LoadStorageFromMemory(id: string) {
        this.storageMemory[id] = deserializedMemory[id];

        return this.storageMemory[id];
    }

    private SaveStorageMemory(memObject: IStorageMemory) {
        let memPath = memObject.SavePath;
        let storagePath = this.MakeStoragePath(memObject.id, memPath);
        this.storageMemory[storagePath] = memObject;
        let parentObj: StorageMemoryStructure | IStorageMemory = deserializedMemory;
        while (memPath.length > 0) {
            parentObj = parentObj[memPath.shift()!];
        }

        memObject.SaveTo(parentObj);
    }

    private SaveStorageToMemory(memObject: IStorageMemory) {
        this.SaveStorageMemory(memObject);
        let memPath = memObject.SavePath;
        let parentObj: StorageMemoryStructure | IStorageMemory = Memory;
        while (memPath.length > 0) {
            parentObj = parentObj[memPath.shift()!];
        }

        parentObj[memObject.id] = JSON.parse(JSON.stringify(memObject.SaveData))
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