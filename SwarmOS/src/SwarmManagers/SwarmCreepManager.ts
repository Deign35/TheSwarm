import { SwarmCreep } from "SwarmObjects/SwarmCreep";
import { profile } from "Tools/Profiler";
import { SwarmManager } from "SwarmManagers/SwarmManager";
import { SwarmCreator } from "SwarmObjects/SwarmCreator";

const CREEP_SAVE_PATH = ['creeps'];
@profile
export class SwarmCreepController extends SwarmManager<StorageMemoryType.Creep, SwarmCreep> implements ISwarmCreepController {
    protected getManagerSavePath(): string[] {
        return CREEP_SAVE_PATH;
    }
    protected OnPrepareSwarm(swarmObj: SwarmCreep): void {
        // Prep the creep
    }
    protected OnActivateSwarm(swarmObj: SwarmCreep): void {
        // Prep the creep
    }
    protected OnFinalizeSwarm(swarmObj: SwarmCreep): void {
        // Finalize any data
    }
    protected getSwarmType(obj: Creep): SwarmType.SwarmCreep {
        return SwarmType.SwarmCreep;
    }
    protected getStorageType(): StorageMemoryType.Creep {
        return StorageMemoryType.Creep;
    }
    protected FindAllGameObjects(): { [id: string]: Creep; } {
        return Game.creeps;
    }


    private static _instance: SwarmCreepController;
    static PrepareTheSwarm() {
        SwarmCreepController._instance = new SwarmCreepController();
        return SwarmCreepController._instance.PrepareTheSwarm();
    }
    static ActivateSwarm() { SwarmCreepController._instance.ActivateSwarm(); }
    static FinalizeSwarmActivity() { return SwarmCreepController._instance.FinalizeSwarmActivity(); }
} global['SwarmCreepController'] = SwarmCreepController;