import { SwarmCreep } from "SwarmTypes/SwarmCreep";
import { profile } from "Tools/Profiler";
import { SwarmManager, PrimeManager } from "SwarmManagers/SwarmManager";

const CREEP_SAVE_PATH = ['creeps'];
@profile
export class SwarmCreepController extends PrimeManager<SwarmControllerDataTypes.Creeps, SwarmType.SwarmCreep, SwarmDataType.Creep, Creep>
    implements ISwarmCreepController {
    protected GetTypeOf(obj: Creep): SwarmType.SwarmCreep {
        return SwarmType.SwarmCreep;
    }
    protected get _dataType(): SwarmControllerDataTypes.Creeps {
        return SwarmControllerDataTypes.Creeps;
    }
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
    protected getStorageType(): SwarmDataType.Creep {
        return SwarmDataType.Creep;
    }
    protected FindAllGameObjects(): { [id: string]: Creep; } {
        return Game.creeps;
    }


    private static _instance: SwarmCreepController;
    static GetSwarmObject(creepName: string): ISwarmCreep {
        return this._instance.GetSwarmObject(creepName) as ISwarmCreep;
    }
    static PrepareTheSwarm() {
        SwarmCreepController._instance = new SwarmCreepController();
        return SwarmCreepController._instance.PrepareTheSwarm();
    }
    static ActivateSwarm() { SwarmCreepController._instance.ActivateSwarm(); }
    static FinalizeSwarmActivity() { return SwarmCreepController._instance.FinalizeSwarmActivity(); }
} global['SwarmCreepController'] = SwarmCreepController;