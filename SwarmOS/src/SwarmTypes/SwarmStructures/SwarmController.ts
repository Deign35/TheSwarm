import { OwnedSwarmStructure } from "./SwarmStructure";
import { profile } from "Tools/Profiler";

@profile
export class SwarmController extends OwnedSwarmStructure<SwarmType.SwarmController,
STRUCTURE_CONTROLLER, StructureController> implements ISwarmController, StructureController {

    get SwarmType(): SwarmType.SwarmController { return SwarmType.SwarmController; }
    get level() { return this._instance.level; }
    get progress() { return this._instance.progress; }
    get progressTotal() { return this._instance.progressTotal; }
    get reservation() { return this._instance.reservation; }
    get safeMode() { return this._instance.safeMode; }
    get safeModeAvailable() { return this._instance.safeModeAvailable; }
    get safeModeCooldown() { return this._instance.safeModeCooldown; }
    get sign() { return this._instance.sign; }
    get ticksToDowngrade() { return this._instance.ticksToDowngrade; }
    get upgradeBlocked() { return this._instance.upgradeBlocked; }

    activateSafeMode() { return this._instance.activateSafeMode(); }
    unclaim() { return this._instance.unclaim(); }
    protected OnActivate() {
        console.log("Successfully activated a Controller");
    }
}
export function MakeSwarmController(controller: StructureController): ISwarmController {
    return new SwarmController(controller);
}