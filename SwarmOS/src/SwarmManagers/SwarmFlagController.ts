
import { profile } from "Tools/Profiler";
import { SwarmManager } from "./SwarmManager";
import { SwarmFlag } from "SwarmItems/SwarmFlag";

const FLAG_SAVE_PATH = ['flags'];
@profile
export class SwarmFlagController extends SwarmManager<SwarmFlag> implements ISwarmFlagController {
    protected getManagerSavePath(): string[] {
        return FLAG_SAVE_PATH;
    }
    protected getSwarmType(obj: Flag): SwarmType.SwarmFlag {
        return SwarmType.SwarmFlag
    }
    protected getStorageType(): StorageMemoryType.Flag {
        return StorageMemoryType.Flag;
    }
    protected FindAllGameObjects(): { [id: string]: Flag; } {
        return Game.flags;
    }
    protected OnPrepareSwarm(swarmObj: SwarmFlag): void {

    }
    protected OnActivateSwarm(swarmObj: SwarmFlag): void {

    }
    protected OnFinalizeSwarm(swarmObj: SwarmFlag): void {

    }
    private static _instance: SwarmFlagController;
    static GetSwarmObject(flagName: string): TSwarmFlag {
        return this._instance.GetSwarmObject(flagName);
    }
    static PrepareTheSwarm() {
        this._instance = new SwarmFlagController();
        this._instance.PrepareTheSwarm();
    }
    static ActivateSwarm() { this._instance.ActivateSwarm() }
    static FinalizeSwarmActivity() { this._instance.FinalizeSwarmActivity(); }
} global["SwarmFlagController"] = SwarmFlagController;