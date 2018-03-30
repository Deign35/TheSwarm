import { profile } from "Tools/Profiler";
import { MasterSwarmMemory, MasterCreepMemory, MasterFlagMemory, MasterRoomMemory, MasterStructureMemory, MasterRoomObjectMemory, MasterOtherMemory } from "SwarmMemory/StorageMemory";
import { NotImplementedException } from "Tools/SwarmExceptions";
declare var Memory: ISwarmMemoryStructure;

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
            let newMemory: ISwarmMemoryStructure = {
                creeps: {
                    id: "creeps",
                    ChildData: {},
                    MEM_TYPE: SwarmDataType.Master
                },
                flags: {
                    id: "flags",
                    ChildData: {},
                    MEM_TYPE: SwarmDataType.Master
                },
                structures: {
                    id: "structures",
                    ChildData: {},
                    MEM_TYPE: SwarmDataType.Master
                },
                rooms: {
                    id: "rooms",
                    ChildData: {},
                    MEM_TYPE: SwarmDataType.Master
                },
                roomObjects: {
                    id: "roomObjects",
                    ChildData: {},
                    MEM_TYPE: SwarmDataType.Master
                },
                otherData: {
                    id: "otherData",
                    ChildData: {},
                    MEM_TYPE: SwarmDataType.Master
                },
                stats: {
                    rooms: {},
                    market: {},
                    totalGCL: 0
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

    ValidateMemory() {
        if (!Memory.INIT || Memory.SwarmVersionDate != SWARM_VERSION_DATE) {
            global['Swarmlord'] = new Swarmlord();
        }
    }

    SaveMasterMemory<T extends MasterMemoryTypes>(memObject: T, save?: boolean): void {
        let memData = memObject.ReleaseMemory();
        if (save) {
            Memory[memObject.id] = memData;
        }
    }

    CheckoutMasterMemory(id: string) {
        let data = CopyObject(Memory[id]);
        let newMem: MasterMemoryTypes | undefined = undefined;
        switch (data.id) {
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
            case (SwarmControllerDataTypes.Other):
                newMem = new MasterOtherMemory(data);
        }

        if (!newMem) {
            throw new NotImplementedException("Attempted to checkout memory that isn't mastered correctly: " + id);
        }

        newMem.ReserveMemory();
        return newMem;
    }
}

global['Swarmlord'] = new Swarmlord();