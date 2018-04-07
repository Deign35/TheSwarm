import { profile } from "Tools/Profiler";
import { MasterSwarmMemory, MasterCreepMemory, MasterFlagMemory, MasterRoomMemory, MasterStructureMemory, MasterRoomObjectMemory, MemoryBase, MasterConsulMemory } from "SwarmMemory/SwarmMemory";
import { NotImplementedException } from "Tools/SwarmExceptions";
declare interface IMemory {
    consuls: IMasterConsulData,
    creeps: IMasterCreepData,
    flags: IMasterFlagData,
    rooms: IMasterRoomData,
    roomObjects: IMasterRoomObjectData,
    structures: IMasterStructureData,

    INIT: boolean,
    SwarmVersionDate: string,
    profiler: any
};
declare var Memory: IMemory;

@profile
export class Swarmlord {
    constructor() {
        this.InitializeMemory();
    }
    private InitializeMemory() {
        if (!Memory.INIT || Memory.SwarmVersionDate != SWARM_VERSION_DATE) {
            let initTimer = new Stopwatch();
            initTimer.Start();
            global['Swarmlord'] = this;

            SwarmLogger.Log("Begin initialization of memory for entire Swarm(" + SWARM_VERSION_DATE + ")");
            let newMemory = {
                consuls: {
                    id: "consuls",
                    ChildData: {},
                    MEM_TYPE: SwarmDataType.Master,
                    SUB_TYPE: SwarmDataType.Consul,
                },
                creeps: {
                    id: "creeps",
                    ChildData: {},
                    MEM_TYPE: SwarmDataType.Master,
                    SUB_TYPE: SwarmDataType.Creep,
                },
                flags: {
                    id: "flags",
                    ChildData: {},
                    MEM_TYPE: SwarmDataType.Master,
                    SUB_TYPE: SwarmDataType.Flag,
                },
                structures: {
                    id: "structures",
                    ChildData: {},
                    MEM_TYPE: SwarmDataType.Master,
                    SUB_TYPE: SwarmDataType.Structure,
                },
                rooms: {
                    id: "rooms",
                    ChildData: {},
                    MEM_TYPE: SwarmDataType.Master,
                    SUB_TYPE: SwarmDataType.Room,
                },
                roomObjects: {
                    id: "roomObjects",
                    ChildData: {},
                    MEM_TYPE: SwarmDataType.Master,
                    SUB_TYPE: SwarmDataType.RoomObject,
                },
                stats: {
                    rooms: {},
                    market: {},
                    totalGCL: 0
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

    SaveMasterMemory<T extends SwarmDataTypeSansMaster,
        U extends SwarmType>(memObject: MasterSwarmMemory<T, U, ISwarmData<T, U, number | string>,
            IMasterData<T>>, save: boolean): void {
        let memData = memObject.ReleaseMemory();
        if (save) {
            Memory[memObject.id] = memData;
        }
    }

    CheckoutMasterMemory<T extends SwarmDataTypeSansMaster,
        U extends SwarmType>(id: string) {
        let data = CopyObject(Memory[id]);
        let newMem;
        switch (data.id) {
            case ("consuls"):
                newMem = new MasterConsulMemory(data);
                break;
            case ("creeps"):
                newMem = new MasterCreepMemory(data);
                break;
            case ("flags"):
                newMem = new MasterFlagMemory(data);
                break;
            case ("rooms"):
                newMem = new MasterRoomMemory(data);
                break;
            case ("structures"):
                newMem = new MasterStructureMemory(data);
                break;
            case ("roomObjects"):
                newMem = new MasterRoomObjectMemory(data);
                break;
        }

        if (!newMem) {
            throw new NotImplementedException("[Swarmlord.CheckoutMasterMemory] -- Attempted to checkout memory that isn't mastered correctly: " + id);
        }
        return newMem;
    }
}

global['Swarmlord'] = new Swarmlord();