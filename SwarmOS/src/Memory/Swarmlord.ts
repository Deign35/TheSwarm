import { profile } from "Tools/Profiler";
import { CreepMemory, FlagMemory, RoomMemory, StructureMemory, RoomObjectMemory, OtherMemory, MasterSwarmMemory } from "Memory/StorageMemory";
import { InvalidArgumentException } from "Tools/SwarmExceptions";
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
    
    SaveMemory<T extends MasterTypes>(memObject: T, save?: boolean): void {
        if (save) {
            memObject.SaveToParent(Memory);
        }
        memObject.ReleaseMemory();
    }


    CheckoutMasterMemory<T extends SwarmControllerDataTypes, U extends SwarmType>(dataType: T) {
        switch (dataType) {
            case (SwarmControllerDataTypes.Creeps): return new MasterSwarmMemory(dataType, CopyObject(Memory["creeps"]));
            case (SwarmControllerDataTypes.Flags): return new MasterSwarmMemory(dataType, CopyObject(Memory["flags"]));
            case (SwarmControllerDataTypes.Rooms): return new MasterSwarmMemory(dataType, CopyObject(Memory["rooms"]));
            case (SwarmControllerDataTypes.Structures): return new MasterSwarmMemory(dataType, CopyObject(Memory["structures"]));
        }

        throw new InvalidArgumentException("Not a master type: " + dataType);
    }
    /*SaveMemory(memObject: TMasterMemoryTypes, save: boolean = true) {
        if (save) {
            memObject.SaveToParent(Memory);
        }
        memObject.ReleaseMemory();
    }*/
}

global['Swarmlord'] = new Swarmlord();