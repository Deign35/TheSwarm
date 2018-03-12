import { profile } from "Tools/Profiler";
import { NotImplementedException, SwarmException, MemoryNotFoundException, AlreadyExistsException, InvalidArgumentException } from "Tools/SwarmExceptions";
import { StorageMemory, CreepMemory, ConsulMemory, FlagMemory, RoomMemory, StructureMemory, BasicMemory } from "Memory/StorageMemory";
import { SwarmLogger } from "Tools/SwarmLogger";
import { SwarmQueen } from "Queens/SwarmQueen";

declare var Memory: StorageMemoryStructure;
var deserializedMemory = CopyObject(Memory);

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
            let initTimer = new Stopwatch();
            initTimer.Start();

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
            SwarmQueen.InitSwarmQueen();

            for (let id in Memory) {
                delete Memory[id];
            }
            for (let id in deserializedMemory) {
                Memory[id] = CopyObject(deserializedMemory[id]);
            }
            initTimer.Stop();
            SwarmLogger.Log("End initialization of memory.  Initialization took: " + initTimer.ToString());
        }
    }

    StorageMemoryTypeToString(memType: StorageMemoryType): string {
        switch (memType) {
            case (StorageMemoryType.Room):
                return 'rooms';
            case (StorageMemoryType.Creep):
                return 'creeps';
            case (StorageMemoryType.Flag):
                return 'flags';
            case (StorageMemoryType.Structure):
                return 'structures';
            case (StorageMemoryType.Consul):
            default:
                throw new InvalidArgumentException('Tried to retrieve invalid memory type [' + memType + ']');
        }
    }
    
    ValidateMemory() {
        if (!Memory.INIT) {
            global['Swarmlord'] = new Swarmlord();
        }
    }

    CheckoutMemory(id: string, path: string[]) {
        let mem = this.LoadStorageMemory(id, path);
        mem.ReserveMemory();

        return mem;
    }

    ReleaseMemory(mem: IStorageMemory, save: boolean = true) {
        if (!save) {
            let memPath = mem.GetSavePath();
            let storagePath = this.MakeStoragePath(mem.id, memPath);
            // reload from the memory object
            delete this.storageMemory[storagePath];
        } else {
            this.SaveStorageMemory(mem);
        }
    }

    /**
     * Loads memory from the cached memory object.
     * @param id id of the memory object to retrieve
     * @param path the path to the parent object.
     */
    private LoadStorageMemory(id: string, path: string[]) {
        let storagePath = this.MakeStoragePath(id, path);
        let parentObj: IStorageMemory;
        if (!this.storageMemory[storagePath]) {
            if (path.length == 0) {
                parentObj = this.LoadDataFromMemory(id);
            } else {
                parentObj = this.LoadStorageMemory(path.slice(-1)[0], path.slice(0, -1));
            }

            this.storageMemory[storagePath] = CopyObject(parentObj[id]);
        }

        return this.storageMemory[storagePath];
    }

    /**
     * Loads the entire branch of storage memory.
     * i.e. LoadStorageFromMemory("creeps");  LoadStorageFromMemory("rooms");
     * @param id The id of the ParentCache
     */
    private LoadDataFromMemory(id: string) {
        this.storageMemory[id] = deserializedMemory[id];
        return this.storageMemory[id];
    }

    /**
     * Saves the storage memory to the deserializedMemory object that backs
     * the cached version of the memory object.
     * @param memObject The memory object to save.
     */
    private SaveStorageMemory(memObject: IStorageMemory) {
        this.SaveToStorageMemoryStructure(memObject, deserializedMemory);

        let path = memObject.GetSavePath();
        if (path.length > 0) {
            // Need to copy changes up
            let parentObj = this.storageMemory[this.MakeStoragePath(path.shift()!, path)]
            memObject.SaveTo(parentObj);
        } else {
            memObject.SaveTo(deserializedMemory);
        }
    }

    /**
     * Saves the data to permanent storage (i.e. Memory[id] = memObject._cache)
     * @param memObject The memory object to save
     */
    private SaveStorageToMemory(memObject: IStorageMemory) {
        this.SaveStorageMemory(memObject);
        this.SaveToStorageMemoryStructure(memObject, Memory);
    }

    /**
     * Saves the data to the provided memory structure.
     * @param memObject The memory object to save
     * @param memStructure The memory structure to save to.
     */
    private SaveToStorageMemoryStructure(memObject: IStorageMemory, memStructure: StorageMemoryStructure) {
        let memPath = memObject.GetSavePath();
        let parentObj: StorageMemoryStructure | SwarmData = memStructure;
        while (memPath.length > 0) {
            parentObj = parentObj[memPath.shift()!];
        }

        memObject.SaveTo(parentObj);
        parentObj[memObject.id] = memObject.GetSaveData();
    }

    /**
     *  Combines the path and id into a single string
     *  for use in cached lookups.
     * @param id The id of the memory to save
     * @param path The path of the memory object
     * @returns The combined string
     */
    private MakeStoragePath(id: string, path: string[]): string {
        let storagePath = "";
        for (let i = 0; i < path.length; i++) {
            storagePath += path[i] + '_';
        }

        return storagePath + id;
    }
}

global['Swarmlord'] = new Swarmlord();