import { SwarmMemory } from "Memory/SwarmMemory";
import { CreepCommandType, SwarmReturnCode } from "SwarmEnums";
import * as _ from "lodash";
import { BasicCreepCommand } from "Commands/BasicCreepCommand";

export const Conditions = {
    CreepEmpty: -100,
    CreepFull: -101,
    NoTarget: -102,
    TargetMin: -103,
    CarryMin: -104,
    TargetMemoryEqual: -105,
    TargetMemoryLessThan: -106,
    TargetMemoryGreaterThan: -107,
    TargetMemoryLessThanOrEqual: -108,
    TargetMemoryGreaterThanOrEqual: -109,
    ReturnCode: -110,
}
const NODE_IDS = 'NI';
const CUR_NODE = 'CN';
const ASSIGNED_CREEP = 'AC';
const ASSIGNED_TARGET = 'AT';
export class JobMemory extends SwarmMemory {
    AssignedCreep: string;
    AssignedTarget: string;
    CurNodeID: string;
    JobNodes: { [name: string]: NodeMemory };
    Save() {
        let nodeIds: string[] = [];
        this.ForEach(function (name: string, item: NodeMemory) {
            nodeIds.push(name);
            item.Save();
        });
        this.SetData(NODE_IDS, nodeIds);
        this.SetData(CUR_NODE, this.CurNodeID);
        this.SetData(ASSIGNED_TARGET, this.AssignedTarget);
        this.SetData(ASSIGNED_CREEP, this.AssignedCreep);
        this.Save();
    }
    Load() {
        this.Load();
        this.AssignedCreep = this.GetData(ASSIGNED_CREEP);
        this.AssignedTarget = this.GetData(ASSIGNED_TARGET);
        this.CurNodeID = this.GetData(CUR_NODE);
        let nodeIds = this.GetData(NODE_IDS);
        this.JobNodes = {};
        for (let i = 0, length = nodeIds.length; i < length; i++) {
            this.JobNodes[nodeIds[i]] = new NodeMemory(nodeIds[i], this);
        }
    }
    GetCurNode() {
        return this.JobNodes[this.CurNodeID];
    }
    GetCurCmdType() {
        return this.GetCurNode().Command;
    }
}
const COMMAND_TYPE = 'CT';
const CONDITION_RESPONSES = 'CR';
export class NodeMemory extends SwarmMemory {
    Command: CreepCommandType;
    ConditionResponses: { [conID: number]: any[] };
    Save() {
        this.SetData(COMMAND_TYPE, this.Command);
        this.SetData(CONDITION_RESPONSES, this.ConditionResponses);
        super.Save();
    }
    Load() {
        this.Command = this.GetData(COMMAND_TYPE);
        this.ConditionResponses = this.GetData(CONDITION_RESPONSES);
        super.Load();
    }
    GetResponse(creep: Creep, target: any, commandResponse: SwarmReturnCode) {
        for (let id in this.ConditionResponses) {
            let conditionArgs = this.ConditionResponses[id];
            let conditionMet = false;
            switch (+id) {
                case (Conditions.ReturnCode): conditionMet = conditionArgs[1] == commandResponse; break;
                case (Conditions.CreepEmpty): conditionMet = _.sum(creep.carry) == 0; break;
                case (Conditions.CreepFull): conditionMet = _.sum(creep.carry) == creep.carryCapacity; break;
                case (Conditions.NoTarget):
                    conditionMet = target != undefined;
                    break;
                case (Conditions.CarryMin):
                    if (conditionArgs[2]) { // Specific resource type
                        conditionMet = creep.carry[conditionArgs[2]] ? creep.carry[conditionArgs[2]] >= conditionArgs[1] : false;
                    } else {
                        conditionMet = creep.carry.energy >= conditionArgs[1];
                    }
                    break;
                case (Conditions.TargetMin):
                    if (conditionArgs[2]) {
                        conditionMet = target.store[conditionArgs[2]] ? target.store[conditionArgs[2]] >= conditionArgs[1] : false;
                    } else {
                        conditionMet = target.store.energy >= conditionArgs[1];
                    }
                    break;
            }

            if (conditionMet) {
                return conditionArgs[0];
            }
        }
    }
}