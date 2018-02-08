import { SwarmMemory } from "Memory/SwarmMemory";
import { CommandWeb } from "Memory/CommandWeb";
import { CommandMemory } from "Memory/CommandMemory";
import { BasicCreepCommand } from "Commands/BasicCreepCommand";
import * as SwarmEnums from "SwarmEnums";
import { JobMemory } from "Memory/JobMemory";

const ACTIVE = 'ZZ';
const ASSIGNED_CREEP = 'AC';
const COMMAND_ARGS = 'CA';
const COMMAND_INDEX = 'CI';
const COMMAND_LIST = 'CL';
const COMMAND_FIND_TARGET = 'CFT';
export class JobBase2 extends SwarmMemory implements ICreepJob {
    protected Active: boolean;
    protected CommandArgs: { [id: string]: any } = {};
    protected CommandList: SwarmEnums.BasicCreepCommandType[];
    protected PresetTargets: string[];
    protected CommandIndex: number;
    protected CreepName: string;

    protected ConstructedArgs: Dictionary;
    Save() {
        this.SetData(ACTIVE, this.Active);
        this.SetData(COMMAND_ARGS, this.CommandArgs);
        this.SetData(COMMAND_INDEX, this.CommandIndex);
        this.SetData(COMMAND_LIST, this.CommandList);
        this.SetData(ASSIGNED_CREEP, this.CreepName);
        super.Save();
    }

    Load() {
        super.Load();
        this.CommandArgs = {};
        this.CommandList = [];

        this.Active = this.GetData(ACTIVE);
        this.CommandArgs = this.GetData(COMMAND_ARGS);
        this.CommandIndex = this.GetData(COMMAND_INDEX);
        this.CommandList = this.GetData(COMMAND_LIST);
        this.CreepName = this.GetData(ASSIGNED_CREEP);
    }

    InitJob(repeat: boolean) {
        /*if (!repeat) {
            this.AddCommand(BasicCreepCommandType.C_Suicide);
        }*/
        this.SetData('active', true);
    }

    ConstructArgs(creep: Creep): SwarmEnums.SwarmReturnCode {
        let result = OK as SwarmEnums.SwarmReturnCode;
        let args: Dictionary = {};
        let cmdType = this.CommandList[this.CommandIndex];
        if (BasicCreepCommand.RequiresTarget(cmdType)) {
            let cmdTarget: string | SwarmEnums.SwarmReturnCode = this.PresetTargets[this.CommandIndex];
            if (cmdTarget == COMMAND_FIND_TARGET) {
                cmdTarget = ERR_NOT_FOUND;
                let target = BasicCreepCommand.FindCommandTarget(creep, cmdType);
                if (target != ERR_NOT_FOUND) {
                    cmdTarget = target;
                    this.PresetTargets[this.CommandIndex];
                }
            }

            if (cmdTarget != ERR_NOT_FOUND) {
                let target = Game.getObjectById(cmdTarget as string);
                if (!target) {
                    this.PresetTargets[this.CommandIndex] = COMMAND_FIND_TARGET;
                    result = SwarmEnums.HL_RETRY;
                } else {
                    args['target'] = target;
                }
            } else {
                return ERR_NOT_FOUND;
            }
        }

        if (cmdType == SwarmEnums.BasicCreepCommandType.C_Transfer ||
            cmdType == SwarmEnums.BasicCreepCommandType.C_Pickup ||
            cmdType == SwarmEnums.BasicCreepCommandType.C_Drop ||
            cmdType == SwarmEnums.BasicCreepCommandType.C_Withdraw) {
            args['resourceType'] = RESOURCE_ENERGY;
        }

        this.ConstructedArgs = args;
        return result;
    }

    DeactivateJob(): void {
        this.Active = false;
    }

    ValidateJob(): SwarmEnums.SwarmReturnCode {
        let result = ERR_INVALID_ARGS as SwarmEnums.SwarmReturnCode;
        if (!this.Active) {
            result = ERR_BUSY;
        } else if (!this.CreepName || !Game.creeps[this.CreepName]) {
            return SwarmEnums.HL_REQUIRE_CREEP;
        } else if (Game.creeps[this.CreepName].spawning) {
            return ERR_BUSY;
        }

        return result;
    }

    AddCommand(commandType: SwarmEnums.BasicCreepCommandType, target?: string) {
        this.CommandList.push(commandType);
        this.PresetTargets.push(target ? target : COMMAND_FIND_TARGET);
    }

    Activate(): SwarmEnums.SwarmReturnCode {
        let JobID = undefined;
        let jobResult = this.ValidateJob();
        if (jobResult == OK) {
            let creep = Game.creeps[this.CreepName];
            jobResult = this.ConstructArgs(creep);
            if (jobResult == OK) {
                jobResult = BasicCreepCommand.ExecuteCreepCommand(
                    this.CommandList[this.CommandIndex],
                    creep,
                    this.ConstructedArgs);
            }
        }

        return jobResult;
    }
}