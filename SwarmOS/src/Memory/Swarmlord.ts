import { profile } from "Tools/Profiler";
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

    SaveMasterMemory<T extends TMasterSwarmMemory>(memObject: T, save?: boolean): void {
        if (save) {
            Memory[memObject.id] = memObject.ReleaseMemory();
        }
        memObject.ReleaseMemory();
    }

    CheckoutMasterMemory<T extends TMasterSwarmMemory>(id: string): T {
        return CopyObject(Memory[id]);
    }
}

global['Swarmlord'] = new Swarmlord();