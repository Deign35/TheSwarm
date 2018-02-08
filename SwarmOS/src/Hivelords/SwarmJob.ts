import { SwarmMemory } from "Memory/SwarmMemory";
import { BasicCreepCommand } from "Commands/BasicCreepCommand";
import * as SwarmEnums from "SwarmEnums";;
import * as _ from "lodash";

const ACTIVE = 'ZZ';
const ASSIGNED_CREEP = 'AC';
const BODY_DEFINITION = 'BD';
const COMMAND_ARGS = 'CA';
const COMMAND_INDEX = 'CI';
const COMMAND_LIST = 'CL';
const COMMAND_FIND_TARGET = 'FT';
const SAVED_TARGETS = 'ST';

export class SwarmJob extends SwarmMemory {
    protected Active: boolean;
    protected CommandArgs: { [id: string]: any };
    protected CommandList: SwarmEnums.BasicCreepCommandType[];
    protected SavedTargets: string[];
    protected CommandIndex: number;
    protected CreepName: string;
    BodyDefinition: BodyPartConstant[];

    protected ConstructedArgs: Dictionary;
    Save() {
        this.SetData(ACTIVE, this.Active);
        this.SetData(ASSIGNED_CREEP, this.CreepName);
        this.SetData(BODY_DEFINITION, this.BodyDefinition);
        this.SetData(COMMAND_ARGS, this.CommandArgs);
        this.SetData(COMMAND_INDEX, this.CommandIndex);
        this.SetData(COMMAND_LIST, this.CommandList);
        this.SetData(SAVED_TARGETS, this.SavedTargets);

        super.Save();
    }

    Load() {
        super.Load();
        this.Active = this.GetData(ACTIVE);
        this.CreepName = this.GetData(ASSIGNED_CREEP);
        this.BodyDefinition = this.GetData(BODY_DEFINITION);
        this.CommandArgs = this.GetData(COMMAND_ARGS) || {};
        this.CommandIndex = this.GetData(COMMAND_INDEX) || 0;
        this.CommandList = this.GetData(COMMAND_LIST) || [];
        this.SavedTargets = this.GetData(SAVED_TARGETS) || [];
    }

    ActivateJob() {
        this.Active = true;
    }

    DeactivateJob(): void {
        this.Active = false;
    }

    ValidateJob(): SwarmEnums.SwarmReturnCode {
        let result = OK as SwarmEnums.SwarmReturnCode;
        if (!this.Active) {
            result = ERR_BUSY;
        } else if (!this.CreepName || !Game.creeps[this.CreepName]) {
            delete this.CreepName;
            result = SwarmEnums.HL_REQUIRE_CREEP;
        } else if (Game.creeps[this.CreepName].spawning) {
            result = ERR_BUSY;
        }

        return result;
    }

    SetCreep(creepName: string) {
        let oldCreep = this.CreepName || '';
        if (Memory.creeps[oldCreep] && Memory.creeps[oldCreep].Assigned) {
            delete Memory.creeps[oldCreep].Assigned;
        }

        if (Game.creeps[creepName]) { // Has it already spawned?
            Memory.creeps[creepName].Assigned = this.MemoryID;
        }
        this.CreepName = creepName;
    }

    AddBodyDefinition(body: BodyPartConstant[]) {
        this.BodyDefinition = body;
    }

    AddCommand(commandType: SwarmEnums.BasicCreepCommandType, target?: string) {
        this.CommandList.push(commandType);
        this.SavedTargets.push(target ? target : COMMAND_FIND_TARGET);
    }

    Activate(): SwarmEnums.SwarmReturnCode {
        let jobResult = undefined;
        let creep = Game.creeps[this.CreepName];
        let lastRetry = -1;
        let retryCount = 0;
        // Use CommandArgs here to save cpu.
        do {
            jobResult = this.ConstructArgs(creep);
            if (jobResult == OK) {
                jobResult = BasicCreepCommand.ExecuteCreepCommand(
                    this.CommandList[this.CommandIndex],
                    creep,
                    this.ConstructedArgs);
            }

            let jobResponse = BasicCreepCommand.GetResponse(this.CommandList[this.CommandIndex], jobResult);
            switch (jobResponse) {
                case (SwarmEnums.CRT_Retry):
                    if (lastRetry != this.CommandIndex) {
                        lastRetry = this.CommandIndex;
                        jobResult = SwarmEnums.CRT_Retry;
                        break;
                    }
                    jobResponse = SwarmEnums.CRT_Next;
                    break;
                case (SwarmEnums.CRT_Move):
                    jobResult = creep.moveTo(this.ConstructedArgs['target']);
                    if (jobResult == ERR_TIRED) {
                        jobResult = OK;
                    }
                    break;
                case (SwarmEnums.CRT_Restart):
                    this.CommandIndex = 0;
                    jobResult = SwarmEnums.CRT_Retry;
                    break;
                case (SwarmEnums.CRT_Terminate):
                    this.DeactivateJob();
                    jobResult = OK;
                    break;
                case (SwarmEnums.CRT_Condition_Empty):
                    if (_.sum(creep.carry) == 0) {
                        jobResponse = SwarmEnums.CRT_Next;
                    }
                    break;
                case (SwarmEnums.CRT_Condition_Full):
                    if (_.sum(creep.carry) == creep.carryCapacity) {
                        jobResponse = SwarmEnums.CRT_Next;
                    }
                    break;
            }

            if(jobResponse == SwarmEnums.CRT_Next) {
                this.CommandIndex++;
                jobResult = SwarmEnums.CRT_Retry;
                if (this.CommandIndex >= this.CommandList.length) {
                    this.CommandIndex = 0;
                }
                let prevTarget = this.SavedTargets[this.CommandIndex];
                if(prevTarget != COMMAND_FIND_TARGET) {
                    Memory.TargetData[prevTarget]--;
                    if(Memory.TargetData[prevTarget] <= 0) {
                        delete Memory.TargetData[prevTarget];
                    }
                    this.SavedTargets[this.CommandIndex] = COMMAND_FIND_TARGET;
                }
            }
        } while (jobResult == SwarmEnums.CRT_Retry && retryCount++ < this.CommandList.length * 2);

        if (retryCount > this.CommandList.length) {
            console.log('RetryCount greater than the number of commands');
            if (retryCount >= this.CommandList.length * 2) {
                console.log('Retry maxxed out.');
            }
            Memory['DataDump'].push(this._cache);
        } else {
            console.log(retryCount);
        }
        return jobResult;
    }

    ConstructArgs(creep: Creep): SwarmEnums.SwarmReturnCode {
        let result = OK as SwarmEnums.SwarmReturnCode;
        let args: Dictionary = {};
        let cmdType = this.CommandList[this.CommandIndex];
        if (BasicCreepCommand.RequiresTarget(cmdType)) {
            let cmdTarget: string | SwarmEnums.SwarmReturnCode = this.SavedTargets[this.CommandIndex];
            if (cmdTarget == COMMAND_FIND_TARGET) {
                cmdTarget = ERR_NOT_FOUND;
                let target = BasicCreepCommand.FindCommandTarget(creep, cmdType);
                if (target != ERR_NOT_FOUND) {
                    cmdTarget = target;
                    this.SavedTargets[this.CommandIndex] = target;
                    if (Memory.TargetData[target]) {
                        Memory.TargetData[target]++;
                    }
                    else {
                        Memory.TargetData[target] = 1;
                    }
                }
            }

            if (cmdTarget != ERR_NOT_FOUND) {
                let target = Game.getObjectById(cmdTarget as string);
                if (!target) {
                    this.SavedTargets[this.CommandIndex] = COMMAND_FIND_TARGET;
                    return ERR_NOT_FOUND;
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
}