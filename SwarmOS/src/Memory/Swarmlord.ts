import { profile } from "Tools/Profiler";
import { NotImplementedException, SwarmException, MemoryNotFoundException, AlreadyExistsException, InvalidArgumentException } from "Tools/SwarmExceptions";
import { StorageMemory, CreepMemory, ConsulMemory, FlagMemory, RoomMemory, StructureMemory, BasicMemory } from "Memory/StorageMemory";
import { SwarmQueen } from "SwarmManagers/SwarmQueen";
import { SwarmCreepController } from "SwarmManagers/SwarmCreepManager"
import { SwarmFlagController } from "SwarmManagers/SwarmFlagController"
import { SwarmStructureController } from "SwarmManagers/SwarmStructureController"

declare var Memory: StorageMemoryStructure;

function ConvertDataToMemory<T extends StorageMemoryTypes>(id: string, path: string[], data: T): IStorageMemory<T> {
    let memCopy = CopyObject(data);
    let memoryType = memCopy[MEM_TYPE] as StorageMemoryType;
    switch (memoryType) {
        case (StorageMemoryType.Creep): return new CreepMemory(id, path, memCopy as CreepData);
        case (StorageMemoryType.Consul): return new ConsulMemory(id, path, memCopy as ConsulData);
        case (StorageMemoryType.Flag): return new FlagMemory(id, path, memCopy as FlagData);
        case (StorageMemoryType.Room): return new RoomMemory(id, path, memCopy as RoomData);
        case (StorageMemoryType.Structure): return new StructureMemory(id, path, memCopy as StructureData);
    }

    return new BasicMemory(id, path, memCopy);
}
function CreateNewMemory(id: string, path: string[], memoryType: StorageMemoryType) {
    switch (memoryType) {
        case (StorageMemoryType.Creep): return new CreepMemory(id, path);
        case (StorageMemoryType.Consul): return new ConsulMemory(id, path);
        case (StorageMemoryType.Flag): return new FlagMemory(id, path);
        case (StorageMemoryType.Room): return new RoomMemory(id, path);
        case (StorageMemoryType.Structure): return new StructureMemory(id, path);
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

            SwarmLogger.Log("Begin initialization of memory for entire Swarm");
            let newCreepObject = {};
            for (const creepName in Game.creeps) {
                newCreepObject[creepName] = {};
            }
            let newMemory = {
                creeps: newCreepObject,
                flags: {},
                structures: {},
                rooms: {},
                profiler: Memory.profiler, // Hacky, but cleanest way to prevent the profiler from breaking because of deleting its memory.
                SwarmVersionDate: SWARM_VERSION_DATE,
                INIT: true
            };

            for (let id in Memory) {
                delete Memory[id];
            }

            for (let id in newMemory) {
                Memory[id] = newMemory[id];
            }
            this.InitBaseMemoryFolders();

            // init stuff
            new SwarmQueen().FinalizeSwarmActivity();
            new SwarmCreepController().FinalizeSwarmActivity();
            new SwarmStructureController().FinalizeSwarmActivity();
            new SwarmFlagController().FinalizeSwarmActivity();

            initTimer.Stop();
            SwarmLogger.Log("End initialization of memory.  Initialization took: " + initTimer.ToString());
        } else {
            this.InitBaseMemoryFolders();
        }
    }
    private InitBaseMemoryFolders() {
        let memType = this.StorageMemoryTypeToString(StorageMemoryType.Creep);
        this.storageMemory[memType] = this.LoadDataFromMemory(memType, StorageMemoryType.Creep);
        memType = this.StorageMemoryTypeToString(StorageMemoryType.Flag);
        this.storageMemory[memType] = this.LoadDataFromMemory(memType, StorageMemoryType.Flag);
        memType = this.StorageMemoryTypeToString(StorageMemoryType.Room);
        this.storageMemory[memType] = this.LoadDataFromMemory(memType, StorageMemoryType.Room);
        memType = this.StorageMemoryTypeToString(StorageMemoryType.Structure);
        this.storageMemory[memType] = this.LoadDataFromMemory(memType, StorageMemoryType.Structure);
    }

    GetMemoryEntries(memType: StorageMemoryType): string[] {
        let storage = this.storageMemory[this.StorageMemoryTypeToString(memType)];
        return Object.getOwnPropertyNames(storage);
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
        if (!Memory.INIT || Memory.SwarmVersionDate != SWARM_VERSION_DATE) {
            global['Swarmlord'] = new Swarmlord();
        }
    }

    CreateNewStorageMemory(id: string, path: string[], memoryType: StorageMemoryType): void {
        let targetObject = Memory;
        for (let i = 0; i < path.length; i++) {
            if (!targetObject[path[i]]) {
                throw new MemoryNotFoundException('Could not add ' + id + ' to ' + this.MakeStoragePath(path.slice(-i)[0], path.slice(0, -i)));
                //this.CreateNewStorageMemory(path[i], path.slice(0, i - 1));
            }
            targetObject = targetObject[path[i]];
        }
        if (targetObject[id]) {
            return;
        }
        let mem = CreateNewMemory(id, path, memoryType);
        this.storageMemory[this.MakeStoragePath(id, path)] = mem;
        targetObject[id] = mem.GetSaveData();
    }

    CheckoutMemory<T extends StorageMemoryTypes, U extends IStorageMemory<T>>(id: string, path: string[], memoryType: StorageMemoryType): U {
        let mem = this.LoadStorageMemory<T>(id, path, memoryType);
        mem.ReserveMemory();

        return mem as U;
    }

    ReleaseMemory<T extends StorageMemoryTypes>(mem: IStorageMemory<T>, save: boolean = true) {
        if (save) {
            this.SaveStorageToMemory(mem);
        }
        let memPath = mem.GetSavePath();
        let storagePath = this.MakeStoragePath(mem.id, memPath);
        delete this.storageMemory[storagePath];
    }

    DeleteMemory<T extends StorageMemoryTypes>(mem: IStorageMemory<T>) {
        this.ReleaseMemory(mem, false);
        this.DeleteFromStorageMemory(mem);
        this.DeleteFromMemoryStructure(mem);
    }

    /**
     * Loads memory from the cached memory object.
     * @param id id of the memory object to retrieve
     * @param path the path to the parent object.
     */
    private LoadStorageMemory<T extends StorageMemoryTypes>(id: string, path: string[], memoryType: StorageMemoryType): IStorageMemory<T> {
        //debugger;
        let storagePath = this.MakeStoragePath(id, path);
        let parentObj: IStorageMemory<T>;
        if (!this.storageMemory[storagePath]) {
            if (path.length == 0) {
                return this.LoadDataFromMemory<T>(id, memoryType);
            } else {
                parentObj = this.LoadStorageMemory(path.slice(-1)[0], path.slice(0, -1), memoryType);
            }

            if (!parentObj || !memoryType) {
                throw new MemoryNotFoundException('Could not add ' + id + ' to ' + this.MakeStoragePath(path.slice(-1)[0], path.slice(0, -1)));
            } else if (!parentObj[id]) {
                this.CreateNewStorageMemory(id, path, memoryType);
                let newMem = this.CheckoutMemory(id, path, memoryType);
                newMem.SaveTo(parentObj);
                this.storageMemory[storagePath] = newMem;
            } else {
                this.storageMemory[storagePath] = ConvertDataToMemory(id, path, parentObj[id]);
            }
        }

        return this.storageMemory[storagePath];
    }

    /**
     * Loads the entire branch of storage memory.
     * i.e. LoadStorageFromMemory("creeps");  LoadStorageFromMemory("rooms");
     * @param id The id of the ParentCache
     */
    private LoadDataFromMemory<T extends StorageMemoryTypes>(id: string, memoryType: StorageMemoryType): IStorageMemory<T> {
        this.storageMemory[id] = Memory[id];
        return this.storageMemory[id];
    }

    private DeleteFromMemoryStructure<T extends StorageMemoryTypes>(memObject: IStorageMemory<T>) {
        // Load parent and delete from there.
    }
    private DeleteFromStorageMemory<T extends StorageMemoryTypes>(memObject: IStorageMemory<T>) {
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
    private SaveStorageMemoryToParentMemory<T extends StorageMemoryTypes>(memObject: IStorageMemory<T>) {
        let path = memObject.GetSavePath();
        if (path.length > 0) {
            // Need to copy changes up
            let parentObj = this.storageMemory[this.MakeStoragePath(path.shift()!, path)]
            memObject.SaveTo(parentObj);
        }
    }

    /**
     * Saves the data to permanent storage (i.e. Memory[id] = memObject._cache)
     * @param memObject The memory object to save
     */
    private SaveStorageToMemory<T extends StorageMemoryTypes>(memObject: IStorageMemory<T>) {
        this.SaveStorageMemoryToParentMemory(memObject);
        this.SaveToStorageMemoryStructure(memObject, Memory);
    }

    /**
     * Saves the data to the provided memory structure.
     * @param memObject The memory object to save
     * @param memStructure The memory structure to save to.
     */
    private SaveToStorageMemoryStructure<T extends StorageMemoryTypes>(memObject: IStorageMemory<T>, memStructure: StorageMemoryStructure) {
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