import { profile } from "Tools/Profiler";
import { NotImplementedException, SwarmException, MemoryNotFoundException, AlreadyExistsException, InvalidArgumentException } from "Tools/SwarmExceptions";
import { StorageMemory, CreepMemory, FlagMemory, RoomMemory, StructureMemory, BasicMemory, RoomObjectMemory } from "Memory/StorageMemory";

declare var Memory: StorageMemoryStructure;

function ConvertDataToMemory<T extends StorageMemoryTypes>(id: string, path: string[], data: T) {
    let memCopy = CopyObject(data);
    let memoryType = memCopy[MEM_TYPE] as StorageMemoryType;
    switch (memoryType) {
        case (StorageMemoryType.Creep): return new CreepMemory(id, path, memCopy as CreepData);
        case (StorageMemoryType.Flag): return new FlagMemory(id, path, memCopy as FlagData);
        case (StorageMemoryType.Room): return new RoomMemory(id, path, memCopy as RoomData);
        case (StorageMemoryType.Structure): return new StructureMemory(id, path, memCopy as StructureData);
        case (StorageMemoryType.RoomObject): return new RoomObjectMemory(id, path, memCopy as RoomObjectData);
    }

    return new BasicMemory(id, path, memCopy);
}

function CreateNewMemory(id: string, path: string[], memoryType: StorageMemoryType) {
    switch (memoryType) {
        case (StorageMemoryType.Creep): return new CreepMemory(id, path);
        case (StorageMemoryType.Flag): return new FlagMemory(id, path);
        case (StorageMemoryType.Room): return new RoomMemory(id, path);
        case (StorageMemoryType.Structure): return new StructureMemory(id, path);
        case (StorageMemoryType.RoomObject): return new RoomObjectMemory(id, path);
    }
    return new BasicMemory(id, path);
}

@profile
export class Swarmlord implements ISwarmlord {
    constructor() {
        this.storageMemory = {};
        this.InitializeMemory();
    }

    private storageMemory: { [storagePath: string]: IStorageMemory<any> }
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
        let memType = this.StorageMemoryTypeToString(StorageMemoryType.Creep);
        this.storageMemory[memType] = this.LoadDataFromMemory(memType);
        memType = this.StorageMemoryTypeToString(StorageMemoryType.Flag);
        this.storageMemory[memType] = this.LoadDataFromMemory(memType);
        memType = this.StorageMemoryTypeToString(StorageMemoryType.Room);
        this.storageMemory[memType] = this.LoadDataFromMemory(memType);
        memType = this.StorageMemoryTypeToString(StorageMemoryType.Structure);
        this.storageMemory[memType] = this.LoadDataFromMemory(memType);
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
                throw new InvalidArgumentException('Tried to retrieve invalid memory type [' + memType + ']');
        }
    }

    ValidateMemory() {
        if (!Memory.INIT || Memory.SwarmVersionDate != SWARM_VERSION_DATE) {
            global['Swarmlord'] = new Swarmlord();
        }
    }

    CreateNewStorageMemory(id: string, path: string[], memoryType: StorageMemoryType): void {
        /** 
         * This needs to be changed from using the path to just being given the parent object to
         * save to. The parent object needs to be a Dictionary at minimum.
        */
        let targetObject = Memory;
        for (let i = 0; i < path.length; i++) {
            if (!targetObject[path[i]]) {
                throw new MemoryNotFoundException('Could not add ' + id + ' to ' + this.MakeStoragePath(path.slice(-i)[0], path.slice(0, -i)));
            }
            targetObject = targetObject[path[i]];
        }
        if (targetObject[id]) {
            return;
        }
        let newMem = CreateNewMemory(id, path, memoryType);
        this.SaveStorageToMemory(newMem);
    }

    CheckoutMemory<T extends IStorageMemory<StorageMemoryTypes>>(id: string, path: string[], memoryType: StorageMemoryType): T {
        let mem = this.LoadStorageMemory(id, path, memoryType);
        mem.ReserveMemory();

        return mem as T;
    }

    ReleaseMemory(mem: IStorageMemory<StorageMemoryTypes>, save: boolean = true) {
        if (save) {
            this.SaveStorageToMemory(mem);
        }

        mem.ReleaseMemory();
    }

    DeleteMemory(mem: IStorageMemory<StorageMemoryTypes>) {
        this.ReleaseMemory(mem, false);
        this.DeleteFromStorageMemory(mem);
        this.DeleteFromMemoryStructure(mem);
    }

    /**
     * Loads memory from the cached memory object.
     * @param id id of the memory object to retrieve
     * @param path the path to the parent object.
     */
    private LoadStorageMemory(id: string, path: string[], memoryType: StorageMemoryType): IStorageMemory<StorageMemoryTypes> {
        //debugger;
        let storagePath = this.MakeStoragePath(id, path);
        if (!this.storageMemory[storagePath]) {
            let parentObj = this.LoadStorageMemory(path.slice(-1)[0], path.slice(0, -1), memoryType);

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
    private LoadDataFromMemory(id: string): IStorageMemory<StorageMemoryTypes> {
        this.storageMemory[id] = ConvertDataToMemory(id, [], Memory[id]);
        return this.storageMemory[id];
    }

    private DeleteFromMemoryStructure(memObject: IStorageMemory<StorageMemoryTypes>) {
        // Load parent and delete from there.
    }
    private DeleteFromStorageMemory(memObject: IStorageMemory<StorageMemoryTypes>) {
        let memPath = memObject.GetSavePath();
        let storagePath = this.MakeStoragePath(memObject.id, memPath);
        delete this.storageMemory[storagePath];
        // Need to recursively delete as well or it will just get saved back.
    }

    /**
     * Saves the storage memory to the deserializedMemory object that backs
     * the cached version of the memory object.
     * @param memObject The memory object to save.
     */
    private SaveStorageMemoryToParentMemory(memObject: IStorageMemory<StorageMemoryTypes>) {
        let path = memObject.GetSavePath();
        if (path.length > 0) {
            // Need to copy changes up
            let memId = path.pop()!;
            let parentObj = this.storageMemory[this.MakeStoragePath(memId, path)];
            if (!parentObj) {
                parentObj = this.LoadStorageMemory(memId, path, StorageMemoryType.Other);
                //let loadedParentMemory = this.CheckoutMemory(memId, path, StorageMemoryType.Other);
            }

            parentObj.SaveChildMemory(memObject);
        }
    }

    /**
     * Saves the data to permanent storage (i.e. Memory[id] = memObject._cache)
     * @param memObject The memory object to save
     */
    private SaveStorageToMemory(memObject: IStorageMemory<StorageMemoryTypes>) {
        this.SaveStorageMemoryToParentMemory(memObject);
        this.SaveToStorageMemoryStructure(memObject, Memory);
    }

    /**
     * Saves the data to the provided memory structure.
     * @param memObject The memory object to save
     * @param memStructure The memory structure to save to.
     */
    private SaveToStorageMemoryStructure(memObject: IStorageMemory<StorageMemoryTypes>, memStructure: StorageMemoryStructure) {
        let memPath = memObject.GetSavePath();
        let parentObj: StorageMemoryStructure | SwarmData = memStructure;
        while (memPath.length > 0) {
            parentObj = parentObj[memPath.shift()!];
        }

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