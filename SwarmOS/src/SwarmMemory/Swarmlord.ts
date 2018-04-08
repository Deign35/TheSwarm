import { profile } from "Tools/Profiler";
import { NotImplementedException } from "Tools/SwarmExceptions";
import { ParentMemory } from "./SwarmMemory";

declare interface IMemory {
    [MASTER_CONSUL_MEMORY_ID]: IMasterConsulData,
    [MASTER_CREEP_MEMORY_ID]: IMasterCreepData,
    [MASTER_FLAG_MEMORY_ID]: IMasterFlagData,
    [MASTER_ROOM_MEMORY_ID]: IMasterRoomData,
    [MASTER_ROOMOBJECT_MEMORY_ID]: IMasterRoomObjectData,
    [MASTER_STRUCTURE_MEMORY_ID]: IMasterStructureData,

    INIT: boolean,
    SwarmVersionDate: string,
    profiler: any
};
declare var Memory: IMemory;

@profile
export class Swarmlord {
    constructor() {
        Swarmlord.InitializeMemory();
    }
    private static InitializeMemory() {
        if (!Memory.INIT || Memory.SwarmVersionDate != SWARM_VERSION_DATE) {
            let initTimer = new Stopwatch();
            initTimer.Start();
            global['Swarmlord'] = this;

            SwarmLogger.Log("Begin initialization of memory for entire Swarm(" + SWARM_VERSION_DATE + ")");
            let newMemory = {
                [MASTER_CONSUL_MEMORY_ID]: {
                    id: MASTER_CONSUL_MEMORY_ID,
                    ChildData: {},
                    MEM_TYPE: SwarmDataType.Master,
                    SUB_TYPE: SwarmDataType.Consul,
                },
                [MASTER_CREEP_MEMORY_ID]: {
                    id: MASTER_CREEP_MEMORY_ID,
                    ChildData: {},
                    MEM_TYPE: SwarmDataType.Master,
                    SUB_TYPE: SwarmDataType.Creep,
                },
                [MASTER_FLAG_MEMORY_ID]: {
                    id: MASTER_FLAG_MEMORY_ID,
                    ChildData: {},
                    MEM_TYPE: SwarmDataType.Master,
                    SUB_TYPE: SwarmDataType.Flag,
                },
                [MASTER_ROOM_MEMORY_ID]: {
                    id: MASTER_ROOM_MEMORY_ID,
                    ChildData: {},
                    MEM_TYPE: SwarmDataType.Master,
                    SUB_TYPE: SwarmDataType.Room,
                },
                [MASTER_ROOMOBJECT_MEMORY_ID]: {
                    id: MASTER_ROOMOBJECT_MEMORY_ID,
                    ChildData: {},
                    MEM_TYPE: SwarmDataType.Master,
                    SUB_TYPE: SwarmDataType.RoomObject,
                },
                [MASTER_STRUCTURE_MEMORY_ID]: {
                    id: MASTER_STRUCTURE_MEMORY_ID,
                    ChildData: {},
                    MEM_TYPE: SwarmDataType.Master,
                    SUB_TYPE: SwarmDataType.Structure,
                },
                profiler: Memory.profiler, // Hacky, but cleanest way to prevent the profiler from breaking because of deleting its memory.
                SwarmVersionDate: SWARM_VERSION_DATE,
                INIT: false
            } as IMemory;

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

    ValidateMemory() {
        if (!Memory.INIT || Memory.SwarmVersionDate != SWARM_VERSION_DATE) {
            global['Swarmlord'] = new Swarmlord();
        }
    }

    SaveMasterMemory<T extends SwarmDataTypeSansMaster>(memObject: ParentMemory, save: boolean): void {
        memObject.ReserveMemory();
        let memData = memObject.ReleaseMemory();
        if (save) {
            Memory[memObject.id] = memData;
        }
    }

    CheckoutMasterMemory(id: string): ParentMemory {
        let data = CopyObject(Memory[id]);
        let newMem = new ParentMemory(data);

        if (!newMem) {
            throw new NotImplementedException("[Swarmlord.CheckoutMasterMemory] -- Attempted to checkout memory that isn't mastered correctly: " + id);
        }
        return newMem;
    }
}

global['Swarmlord'] = new Swarmlord();