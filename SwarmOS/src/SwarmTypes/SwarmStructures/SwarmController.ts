import { OwnedSwarmStructure } from "./SwarmStructure";
import { SwarmLoader } from "../SwarmLoader";

const CREEP_IDS = 'creeps';
const ALLOWANCE = 'allowance';
const FLASH_PATHING = 'pathData';
declare interface ControllerData {
    [CREEP_IDS]: string[],
    [ALLOWANCE]: number,
    [FLASH_PATHING]: number[]
}
export class SwarmController extends OwnedSwarmStructure<STRUCTURE_CONTROLLER, StructureController>
    implements AIController, StructureController, ControllerData {
    AssignCreep(creepName: string) {
        let oldIDs = this.creeps;
        oldIDs.push(creepName);
        this.memory.SetData(CREEP_IDS, oldIDs, true);
        return true;
    }
    PrepObject() {
        for (let i = 0; i < this.creeps.length; i++) {
            if (!SwarmLoader.HasObject(this.creeps[i], MASTER_CREEP_MEMORY_ID)) {
                this.creeps.splice(i--, 1);
            }
        }
    }
    get creeps(): string[] { return this.memory.GetData(CREEP_IDS); }
    get allowance(): number { return this.memory.GetData(ALLOWANCE); }
    get pathData(): number[] {
        if (!this.memory.HasData(FLASH_PATHING)) {
            // Get pathing data up to 5 or 10 squares away.
        }
        return this.memory.GetData(FLASH_PATHING);
    }

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
}