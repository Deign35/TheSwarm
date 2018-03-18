import { profile } from "Tools/Profiler";
import { NotImplementedException, SwarmException, MemoryNotFoundException, AlreadyExistsException, InvalidArgumentException } from "Tools/SwarmExceptions";
import { StorageMemory, CreepMemory, FlagMemory, RoomMemory, StructureMemory, BasicMemory, RoomObjectMemory } from "Memory/StorageMemory";

declare var Memory: StorageMemoryStructure;

function ConvertDataToMemory<T extends StorageMemoryTypes>(id: string, data: T) {
    let memCopy = CopyObject(data);
    let memoryType = memCopy[MEM_TYPE] as StorageMemoryType;
    switch (memoryType) {
        case (StorageMemoryType.Creep): return new CreepMemory(id, memCopy as CreepData);
        case (StorageMemoryType.Flag): return new FlagMemory(id, memCopy as FlagData);
        case (StorageMemoryType.Room): return new RoomMemory(id, memCopy as RoomData);
        case (StorageMemoryType.Structure): return new StructureMemory(id, memCopy as StructureData);
    }

    return new BasicMemory(id, memCopy);
}

function CreateNewMemory(id: string, memoryType: StorageMemoryType) {
    switch (memoryType) {
        case (StorageMemoryType.Creep): return new CreepMemory(id);
        case (StorageMemoryType.Flag): return new FlagMemory(id);
        case (StorageMemoryType.Room): return new RoomMemory(id);
        case (StorageMemoryType.Structure): return new StructureMemory(id);
    }
    return new BasicMemory(id);
}

var CachedMemState: Dictionary = {};

@profile
export class Swarmlord implements ISwarmlord {
    constructor() {
        //this.storageMemory = {};
        this.InitializeMemory();
    }

    //private storageMemory: { [storagePath: string]: IStorageMemory<any> }
    private InitializeMemory() {
        if (!Memory.INIT || Memory.SwarmVersionDate != SWARM_VERSION_DATE) {
            let initTimer = new Stopwatch();
            initTimer.Start();
            global['Swarmlord'] = this;

            SwarmLogger.Log("Begin initialization of memory for entire Swarm(" + SWARM_VERSION_DATE + ")");
            let newMemory: StorageMemoryStructure = {
                creeps: {},
                flags: {},
                structures: {},
                rooms: {},
                profiler: Memory.profiler, // Hacky, but cleanest way to prevent the profiler from breaking because of deleting its memory.
                SwarmVersionDate: SWARM_VERSION_DATE,
                INIT: false
            };

            for (let id in Memory) {
                delete Memory[id];
            }

            for (let id in newMemory) {
                Memory[id] = newMemory[id];
            }
            this.InitBaseMemoryFolders();
            /*
                        // init stuff
                        new SwarmQueen().FinalizeSwarmActivity();
                        new SwarmCreepController().FinalizeSwarmActivity();
                        new SwarmStructureController().FinalizeSwarmActivity();
                        new SwarmFlagController().FinalizeSwarmActivity();*/

            Memory['INIT'] = true;
            initTimer.Stop();
            SwarmLogger.Log("End initialization of memory.  Initialization took: " + initTimer.ToString());
        } else {
            this.InitBaseMemoryFolders();
        }
    }
    private InitBaseMemoryFolders() {
        /*let memType = this.StorageMemoryTypeToString(StorageMemoryType.Creep);
        this.storageMemory[memType] = this.LoadDataFromMemory(memType, StorageMemoryType.Creep);
        memType = this.StorageMemoryTypeToString(StorageMemoryType.Flag);
        this.storageMemory[memType] = this.LoadDataFromMemory(memType);
        memType = this.StorageMemoryTypeToString(StorageMemoryType.Room);
        this.storageMemory[memType] = this.LoadDataFromMemory(memType);
        memType = this.StorageMemoryTypeToString(StorageMemoryType.Structure);
        this.storageMemory[memType] = this.LoadDataFromMemory(memType);*/
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
            case (StorageMemoryType.RoomObject):
                return 'OBJs';
            default:
                throw new InvalidArgumentException('Tried to retrieve invalid base memory type [' + memType + ']');
        }
    }

    ValidateMemory() {
        if (!Memory.INIT || Memory.SwarmVersionDate != SWARM_VERSION_DATE) {
            global['Swarmlord'] = new Swarmlord();
        }
    }

    CreateNewStorageMemory(id: string, memoryType: StorageMemoryType, parentObj?: IStorageMemory<StorageMemoryTypes>) {
        if (!parentObj) {
            parentObj = this.LoadDataFromMemory(memoryType);
        }
        let mem = CreateNewMemory(id, memoryType);
        parentObj.SetData(id, mem.GetSaveData());
    }

    CheckoutMemory(id: string, memoryType: StorageMemoryType, parentObj?: IStorageMemory<StorageMemoryTypes>): IStorageMemory<StorageMemoryTypes> {
        if (!parentObj) {
            let mem = this.LoadDataFromMemory(memoryType);
            mem.ReserveMemory();
            return mem;
        }
        let mem;
        if (parentObj.HasData(id)) {
            mem = ConvertDataToMemory(id, parentObj.GetData(id));//this.LoadStorageMemory(id, memoryType, parentObj);
        } else {
            mem = CreateNewMemory(id, memoryType);
        }
        mem.ReserveMemory();

        return mem;
    }

    ReleaseMemory2(mem: IStorageMemory<StorageMemoryTypes>, save: boolean = true) {
        if (save) {
            this.SaveStorageToMemory(mem);
        }
        mem.ReleaseMemory();
    }

    /**
     * Loads memory from the cached memory object.
     * @param id id of the memory object to retrieve
     * @param path the path to the parent object.
     *
    private LoadStorageMemory(id: string, memoryType: StorageMemoryType, parentObj?: IStorageMemory<StorageMemoryTypes>): IStorageMemory<StorageMemoryTypes> {
        if (!parentObj) {
            parentObj = this.LoadDataFromMemory(id, memoryType);
        }
        //debugger;
        if (!this.storageMemory[storagePath]) {
            if (path.length == 0) {
                return this.LoadDataFromMemory<EmptyDictionary>(id, memoryType);
            } else {
                parentObj = this.LoadStorageMemory(path.slice(-1)[0], path.slice(0, -1), memoryType);
            }

            if (!parentObj || !memoryType) {
                throw new MemoryNotFoundException('Could not add ' + id + ' to ' + this.MakeStoragePath(path.slice(-1)[0], path.slice(0, -1)));
            } else if (!parentObj.HasData(id)) {
                this.CreateNewStorageMemory(id, path, memoryType);
                return this.LoadStorageMemory(id, path, memoryType);
            } else {
                this.storageMemory[storagePath] = ConvertDataToMemory(id, path, parentObj.GetData(id));
            }
        }

        return this.storageMemory[storagePath];
    }

    /**
     * Loads the entire branch of storage memory.
     * i.e. LoadStorageFromMemory("creeps");  LoadStorageFromMemory("rooms");
     * @param id The id of the ParentCache
     */
    private LoadDataFromMemory(memoryType: StorageMemoryType): IStorageMemory<StorageMemoryTypes> {
        let id = this.StorageMemoryTypeToString(memoryType);
        if (!CachedMemState[id]) {
            CachedMemState[id] = ConvertDataToMemory(id, CopyObject(Memory[id]));
        }
        return CachedMemState[id];
    }
    /*
        private DeleteFromMemoryStructure(memObject: IStorageMemory<StorageMemoryTypes>) {
            // Load parent and delete from there.
        }
        private DeleteFromStorageMemory(memObject: IStorageMemory<StorageMemoryTypes>) {
            let memPath = memObject.GetSavePath();
            let storagePath = this.MakeStoragePath(memObject.id, memPath);
            delete this.storageMemory[storagePath];
            // Need to recursively delete as well or it will just get saved back.
        }
    
        **
         * Saves the storage memory to the deserializedMemory object that backs
         * the cached version of the memory object.
         * @param memObject The memory object to save.
         *
        private SaveStorageMemoryToParentMemory<T extends StorageMemoryTypes>(memObject: IStorageMemory<T>) {
            let path = memObject.GetSavePath();
            if (path.length > 0) {
                // Need to copy changes up
                let parentObj = this.storageMemory[this.MakeStoragePath(path.shift()!, path)]
                memObject.SaveTo(parentObj);
            }
        }/*
    
        /**
         * Saves the data to permanent storage (i.e. Memory[id] = memObject._cache)
         * @param memObject The memory object to save
         */
    private SaveStorageToMemory<T extends StorageMemoryTypes>(memObject: IStorageMemory<T>) {
        //this.SaveStorageMemoryToParentMemory(memObject);
        this.SaveToStorageMemoryStructure(memObject, Memory);
    }

    /**
     * Saves the data to the provided memory structure.
     * @param memObject The memory object to save
     * @param memStructure The memory structure to save to.
     */
    private SaveToStorageMemoryStructure<T extends StorageMemoryTypes>(memObject: IStorageMemory<T>, memStructure: StorageMemoryStructure) {
        let parentObj: StorageMemoryStructure = memStructure;
        let data = memObject.GetSaveData();
        parentObj[memObject.id] = data;
        CachedMemState[memObject.id] = ConvertDataToMemory(memObject.id, CopyObject(data));
    }

    /**
     *  Combines the path and id into a single string
     *  for use in cached lookups.
     * @param id The id of the memory to save
     * @param path The path of the memory object
     * @returns The combined string
     *
    private MakeStoragePath(id: string, path: string[]): string {
        let storagePath = "";
        for (let i = 0; i < path.length; i++) {
            storagePath += path[i] + '_';
        }

        return storagePath + id;
    }*/
}

global['Swarmlord'] = new Swarmlord();