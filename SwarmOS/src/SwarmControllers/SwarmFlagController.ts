
import { profile } from "Tools/Profiler";
import { SwarmController } from "./SwarmController";
import { SwarmFlag } from "SwarmTypes/SwarmFlag";

const FLAG_SAVE_PATH = ['flags'];
@profile
export class SwarmFlagController extends SwarmController<SwarmControllerDataTypes.Flags, SwarmFlag>
    implements ISwarmFlagController {
    protected InitNewObj(swarmObj: SwarmFlag): void {
    }
    get ControllerType(): SwarmControllerDataTypes.Flags { return SwarmControllerDataTypes.Flags; }
    protected GetTypeOf(obj: Flag): SwarmType.SwarmFlag {
        return SwarmType.SwarmFlag;
    }
    protected get _dataType(): SwarmControllerDataTypes.Flags {
        return SwarmControllerDataTypes.Flags;
    }
    protected getSwarmType(obj: Flag): SwarmType.SwarmFlag {
        return SwarmType.SwarmFlag
    }
    protected getStorageType(): SwarmDataType.Flag {
        return SwarmDataType.Flag;
    }
    protected FindAllGameObjects(): { [id: string]: Flag; } {
        return Game.flags;
    }
    protected OnPrepareSwarm(swarmObj: SwarmFlag): void {

    }
    protected OnActivateSwarm(swarmObj: SwarmFlag): void {
        swarmObj.Activate();
    }
    protected OnFinalizeSwarm(swarmObj: SwarmFlag): void {

    }
    private static _instance: SwarmFlagController;
    static GetSwarmObject(flagName: string): ISwarmFlag {
        return this._instance.GetSwarmObject(flagName) as ISwarmFlag;
    }
    static PrepareTheSwarm() {
        this._instance = new SwarmFlagController();
        this._instance.PrepareTheSwarm();
    }
    static ActivateSwarm() { this._instance.ActivateSwarm() }
    static FinalizeSwarmActivity() { this._instance.FinalizeSwarmActivity(); }
} global["SwarmFlagController"] = SwarmFlagController;