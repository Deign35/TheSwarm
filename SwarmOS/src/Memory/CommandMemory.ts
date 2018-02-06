import { SwarmMemory } from "Memory/SwarmMemory";
import { SwarmReturnCode, HL_REQUIRE_CREEP } from "SwarmEnums";
import { JobBase } from "JobRoles/JobBase";

const ASSIGNED_CREEP = 'AC';
const ASSIGNED_SPAWNER = 'AS';
const COMMAND_ARGS = 'CA';
const COMMAND_ID = 'CI';
const COMMAND_TARGET = 'CT';
// This doesn't work.  New strategy @ JobMemory
export class CommandMemory extends SwarmMemory {
    get CurCommandID(): string {
        return this.GetData(COMMAND_ID);
    }
    set CurCommandID(name: string) {
        this.SetData(COMMAND_ID, name);
    }
    get CreepName(): string {
        return this.GetData(ASSIGNED_CREEP);
    }
    set CreepName(name: string) {
        let oldCreep = this.CreepName;
        if (Memory.creeps[oldCreep]) {
            Memory.creeps[oldCreep].Assigned = false;
        }

        Memory.creeps[name].Assigned = true;
        this.SetData(ASSIGNED_CREEP, name);
    }
    get CommandTarget(): string {
        return this.GetData(COMMAND_TARGET);
    }

    set CommandTarget(id: string) {
        let oldTarget = this.CommandTarget;
        if (oldTarget) {
            Memory.TargetData[oldTarget]--;
            if (Memory.TargetData[oldTarget] == 1) {
                delete Memory.TargetData[oldTarget];
            }
        }
        //Memory.TargetData[id] = true;
        this.SetData(COMMAND_TARGET, id);
        if (Memory.TargetData[id]) {
            Memory.TargetData[id]++;
        } else {
            Memory.TargetData[id] = 2;
        }
    }
}