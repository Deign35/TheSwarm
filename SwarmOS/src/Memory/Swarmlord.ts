import { profile } from "Tools/Profiler";
import { CreepMemory, FlagMemory, RoomMemory, StructureMemory, RoomObjectMemory, OtherMemory } from "Memory/StorageMemory";
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
                    MEM_TYPE: SwarmDataType.Master
                },
                flags: {
                    MEM_TYPE: SwarmDataType.Master
                },
                structures: {
                    MEM_TYPE: SwarmDataType.Master
                },
                rooms: {
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
    SaveMemory<T extends TPrimeMemoryTypes>(memObject: T, save?: boolean | undefined): void {
        if (save) {
            memObject.SaveToParent(Memory);
        }
        memObject.ReleaseMemory();
    }

    CheckoutMasterMemory<T extends TPrimeMemoryTypes>(primeType: PrimeDataTypes): T {
        throw new Error("Method not implemented.");
    }
    /*SaveMemory(memObject: TMasterMemoryTypes, save: boolean = true) {
        if (save) {
            memObject.SaveToParent(Memory);
        }
        memObject.ReleaseMemory();
    }*/
}

global['Swarmlord'] = new Swarmlord();