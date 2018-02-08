import { SwarmMemory } from "Memory/SwarmMemory";
import { SwarmReturnCode, HL_REQUIRE_CREEP, CreepCommandType } from "SwarmEnums";
import { JobBase } from "JobRoles/JobBase";

const ASSIGNED_CREEP = 'AC';
const COMMAND_ARGS = 'CA';
const COMMAND_INDEX = 'CI';
const COMMAND_LIST = 'CL';
const COMMAND_TARGET = 'CT';
// This doesn't work.  New strategy @ JobMemory
export class CommandMemory extends SwarmMemory {
    CommandArgs: { [id: string]: any } = {};
    CommandList: CreepCommandType[];
    CommandTarget: string;
    CommandIndex: number;
    CreepName: string;
    Save() {
        this.SetData(COMMAND_ARGS, this.CommandArgs);
        this.SetData(COMMAND_INDEX, this.CommandIndex);
        this.SetData(COMMAND_LIST, this.CommandList);
        this.SetData(COMMAND_TARGET, this.CommandTarget);
        this.SetData(ASSIGNED_CREEP, this.CreepName);
        super.Save();
    }
    Load() {
        this.Load();
        this.CommandArgs = {};
        this.CommandList = [];
        this.CommandArgs = this.GetData(COMMAND_ARGS);
        this.CommandList = this.GetData(COMMAND_LIST);
        this.CommandIndex = this.GetData(COMMAND_INDEX);
        this.CommandTarget = this.GetData(COMMAND_TARGET);
        this.CreepName = this.GetData(ASSIGNED_CREEP);
    }

    SetCreep(creep: Creep) {
        let oldCreep = this.CreepName;
        if (Memory.creeps[oldCreep]) {
            Memory.creeps[oldCreep].Assigned = false;
        }

        Memory.creeps[name].Assigned = true;
        this.CreepName = creep.name;
    }
    SetTarget(target: any) {
        let oldTarget = this.CommandTarget;
        if (oldTarget) {
            Memory.TargetData[oldTarget]--;
            if (Memory.TargetData[oldTarget] == 1) {
                delete Memory.TargetData[oldTarget];
            }
        }
        this.CommandTarget = target.id;
        if (Memory.TargetData[target.id]) {
            Memory.TargetData[target.id]++;
        } else {
            Memory.TargetData[target.id] = 2;
        }
    }

    NextCommand(resetArgs: boolean) {
        this.CommandIndex++;
        if (this.CommandIndex >= this.CommandList.length) {
            this.CommandIndex = 0;
        }

        if (resetArgs) {
            this.CommandArgs = {};
        }
    }
}