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
        this.InitializeMemory();
    }

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

            Memory['INIT'] = true;
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
            this.SaveToStorageMemoryStructure(mem);
        }
        mem.ReleaseMemory();
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


    /**
     * Saves the data to the provided memory structure.
     * @param memObject The memory object to save
     * @param memStructure The memory structure to save to.
     */
    private SaveToStorageMemoryStructure<T extends StorageMemoryTypes>(memObject: IStorageMemory<T>) {
        let data = memObject.GetSaveData();
        Memory[memObject.id] = data;
        CachedMemState[memObject.id] = ConvertDataToMemory(memObject.id, CopyObject(data));
    }
}

global['Swarmlord'] = new Swarmlord();