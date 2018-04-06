import { profile } from "Tools/Profiler";
import { MasterSwarmMemory, MasterCreepMemory, MasterFlagMemory, MasterRoomMemory, MasterStructureMemory, MasterRoomObjectMemory, MemoryBase, MasterConsulMemory } from "SwarmMemory/SwarmMemory";
import { NotImplementedException } from "Tools/SwarmExceptions";
declare var Memory: {
    consuls: IMasterConsulData,
    creeps: IMasterCreepData,
    flags: IMasterFlagData,
    rooms: IMasterRoomData,
    roomObjects: IMasterRoomObjectData,
    Structures: IMasterStructureData,

    INIT: boolean,
    SwarmVersionDate: string,
    profiler: any
};

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
                    SWARM_TYPE: SwarmType.Any,
                },
                creeps: {
                    id: "creeps",
                    ChildData: {},
                    MEM_TYPE: SwarmDataType.Master,
                    SWARM_TYPE: SwarmType.Any,
                },
                flags: {
                    id: "flags",
                    ChildData: {},
                    MEM_TYPE: SwarmDataType.Master,
                    SWARM_TYPE: SwarmType.Any
                },
                structures: {
                    id: "structures",
                    ChildData: {},
                    MEM_TYPE: SwarmDataType.Master,
                    SWARM_TYPE: SwarmType.Any
                },
                rooms: {
                    id: "rooms",
                    ChildData: {},
                    MEM_TYPE: SwarmDataType.Master,
                    SWARM_TYPE: SwarmType.Any
                },
                roomObjects: {
                    id: "roomObjects",
                    ChildData: {},
                    MEM_TYPE: SwarmDataType.Master,
                    SWARM_TYPE: SwarmType.Any
                },
                otherData: {
                    id: "otherData",
                    ChildData: {},
                    MEM_TYPE: SwarmDataType.Master,
                    SWARM_TYPE: SwarmType.Any
                },
                stats: {
                    rooms: {},
                    market: {},
                    totalGCL: 0
                },
                profiler: Memory.profiler, // Hacky, but cleanest way to prevent the profiler from breaking because of deleting its memory.
                SwarmVersionDate: SWARM_VERSION_DATE,
                INIT: false
            }

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

    SaveMasterMemory(memObject: MasterSwarmMemory<MasterSwarmDataTypes, TBasicSwarmData>, save: boolean): void {
        let memData = memObject.ReleaseData();
        if (save) {
            Memory[memObject.id] = memData;
        }
    }

    CheckoutMasterMemory(id: string) {
        let data = CopyObject(Memory[id]);
        let newMem: MasterSwarmMemory<IMasterData<any>, any> | undefined = undefined;
        switch (data.id) {
            case (SwarmControllerDataTypes.Consuls):
                newMem = new MasterConsulMemory(data);
                break;
            case (SwarmControllerDataTypes.Creeps):
                newMem = new MasterCreepMemory(data);
                break;
            case (SwarmControllerDataTypes.Flags):
                newMem = new MasterFlagMemory(data);
                break;
            case (SwarmControllerDataTypes.Rooms):
                newMem = new MasterRoomMemory(data);
                break;
            case (SwarmControllerDataTypes.Structures):
                newMem = new MasterStructureMemory(data);
                break;
            case (SwarmControllerDataTypes.RoomObjects):
                newMem = new MasterRoomObjectMemory(data);
                break;
        }

        if (!newMem) {
            throw new NotImplementedException("[Swarmlord.CheckoutMasterMemory] -- Attempted to checkout memory that isn't mastered correctly: " + id);
        }

        newMem.ReserveMemory();
        return newMem;
    }
}

global['Swarmlord'] = new Swarmlord();