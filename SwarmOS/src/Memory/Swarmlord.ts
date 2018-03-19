import { profile } from "Tools/Profiler";
import { NotImplementedException, SwarmException, MemoryNotFoundException, AlreadyExistsException, InvalidArgumentException } from "Tools/SwarmExceptions";
import { StorageMemory, CreepMemory, FlagMemory, RoomMemory, StructureMemory, BasicMemory, RoomObjectMemory } from "Memory/StorageMemory";

declare var Memory: TStorageMemoryStructure;

function ConvertDataToMemory<T extends SwarmDataType>(id: string, data: any) {
    let memCopy = CopyObject(data);
    let memoryType = memCopy[MEM_TYPE] as T;
    switch (memoryType) {
        case (SwarmDataType.Creep): return new CreepMemory(id, memCopy as ICreepData);
        case (SwarmDataType.Flag): return new FlagMemory(id, memCopy as IFlagData);
        case (SwarmDataType.Room): return new RoomMemory(id, memCopy as IRoomData);
        case (SwarmDataType.Structure): return new StructureMemory(id, memCopy as IStructureData);
        case (SwarmDataType.RoomObject): return new RoomObjectMemory(id, memCopy as IRoomObjectData);
        case (SwarmDataType.Other): return new BasicMemory(id, memCopy as IOtherData<T>);
    }

    return new BasicMemory(id, memCopy as IOtherData<T>);
}

function CreateNewMemory<T extends SwarmDataType>(id: string, memoryType: T) {
    switch (memoryType) {
        case (SwarmDataType.Creep as T): return new CreepMemory(id);
        case (SwarmDataType.Flag as T): return new FlagMemory(id);
        case (SwarmDataType.Room as T): return new RoomMemory(id);
        case (SwarmDataType.Structure as T): return new StructureMemory(id);
        case (SwarmDataType.RoomObject as T): return new RoomObjectMemory(id);
        case (SwarmDataType.Other as T): return new BasicMemory(id);
    }
    return new BasicMemory(id);
}

//var CachedMemState: Dictionary = {};

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
            let newMemory: TStorageMemoryStructure = {
                creeps: {
                    MEM_TYPE: SwarmDataType.Other
                },
                flags: {
                    MEM_TYPE: SwarmDataType.Other
                },
                structures: {
                    MEM_TYPE: SwarmDataType.Other
                },
                rooms: {
                    MEM_TYPE: SwarmDataType.Other
                },
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

    StorageMemoryTypeToString(memType: SwarmDataType): string {
        switch (memType) {
            case (SwarmDataType.Room):
                return 'rooms';
            case (SwarmDataType.Creep):
                return 'creeps';
            case (SwarmDataType.Flag):
                return 'flags';
            case (SwarmDataType.Structure):
                return 'structures';
            case (SwarmDataType.RoomObject):
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

    CreateNewSwarmMemory<T extends SwarmDataType>(id: string, memType: T, parentObj?: TAllSwarmMemoryTypes) {
        if (!parentObj) {
            parentObj = this.LoadDataFromMemory(memType);
        }
        let mem = CreateNewMemory(id, memType);
        parentObj!.SetData(id, mem.GetSwarmData());
    }

    ReserveMem<T extends SwarmDataType>(id: string, memoryType: T, parentObj?: TAllSwarmMemoryTypes): TAllSwarmMemoryTypes {
        if (!parentObj) {
            let mem = ConvertDataToMemory(id, this.LoadDataFromMemory(memoryType));
            mem.ReserveMemory();
            return mem;
        }
        let mem;
        if (parentObj.HasData(id)) {
            mem = ConvertDataToMemory(id, parentObj.GetData<any>(id));
        } else {
            mem = CreateNewMemory(id, memoryType);
        }
        mem.ReserveMemory();

        return mem;
    }

    SaveMemory(memObject: TMasterMemoryTypes, save: boolean = true) {
        if (save) {
            this.SaveToStorageMemoryStructure(memObject);
        }
        memObject.ReleaseMemory();
    }

    /**
     * Loads the entire branch of storage memory.
     * i.e. LoadStorageFromMemory("creeps");  LoadStorageFromMemory("rooms");
     * @param id The id of the ParentCache
     */
    private LoadDataFromMemory<T extends SwarmDataType>(memoryType: T): TAllSwarmMemoryTypes {
        let id = this.StorageMemoryTypeToString(memoryType);
        return ConvertDataToMemory<SwarmDataType.Other>(id,
            CopyObject(Memory[id] as IOtherData<T>))
    }


    /**
     * Saves the data to the provided memory structure.
     * @param memObject The memory object to save
     * @param memStructure The memory structure to save to.
     */
    private SaveToStorageMemoryStructure(memObject: TMasterMemoryTypes) {
        let data = memObject.GetSwarmData();
        Memory[memObject.id] = data;
        //CachedMemState[memObject.id] = ConvertDataToMemory(memObject.id, CopyObject(data));
    }
}

global['Swarmlord'] = new Swarmlord();