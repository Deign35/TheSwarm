import { SwarmMemory } from "Memory/SwarmMemory";
import { CommandWeb } from "Memory/CommandWeb";
import { CommandMemory } from "Memory/CommandMemory";
import { BasicCreepCommand } from "Commands/BasicCreepCommand";
import { CreepCommandType, SwarmReturnCode, HL_REQUIRE_CREEP, HL_NEXT_COMMAND, HL_RETRY, CommandEnd } from "SwarmEnums";
import { JobMemory } from "Memory/JobMemory";

const COMMAND_FIND_TARGET = 'CFT';
export abstract class JobBase extends SwarmMemory implements ICreepJob {
    protected jobMemory: JobMemory;

    ConstructedArgs: Dictionary;
    abstract InitJob(...inArgs: any[]): void;
    abstract ConstructArgs(creep: Creep): SwarmReturnCode;
    abstract SpawnCreep(room: Room): string;
    abstract DeactivateJob(): void;

    ValidateJob(): SwarmReturnCode {
        if (!this.jobMemory.AssignedCreep || !Game.creeps[this.jobMemory.AssignedCreep]) {
            return HL_REQUIRE_CREEP;
        }

        if (Game.creeps[this.jobMemory.AssignedCreep].spawning) {
            return ERR_BUSY;
        }

        return OK;
    }
    Save() {
        this.jobMemory.Save();
        super.Save();
    }

    Load() {
        super.Load();
        this.jobMemory = new JobMemory('jobData', this);
    }

    ProcessJob(): SwarmReturnCode {
        let JobID = undefined;
        let jobResult = this.ValidateJob();
        if (jobResult == OK) {
            let creep = Game.creeps[this.jobMemory.AssignedCreep];
            JobID = this.jobMemory.CurNodeID;
            if (JobID == CommandEnd) {
                console.log('Job has completed');
                return OK;
            }
            jobResult = this.ConstructArgs(creep);
            if (jobResult == OK) {
                jobResult = BasicCreepCommand.ExecuteCreepCommand(this.jobMemory.GetCurCmdType(), creep, this.ConstructedArgs);
            }
        }

        return jobResult;
    }

    Activate(room: Room): SwarmReturnCode {
        let result = ERR_INVALID_ARGS as SwarmReturnCode;
        let lastResult = result;
        let retryCount = 0;
        do {
            result = this.ProcessJob();
            if (result == ERR_BUSY) { break; }
            if (result == HL_REQUIRE_CREEP) { // Change codes here??
                let unAssignedCreeps = room.find(FIND_MY_CREEPS, {
                    filter: (creep) => {
                        return !creep.memory.Assigned;
                    }
                });
                let name = '';
                if (unAssignedCreeps.length > 0) {
                    name = unAssignedCreeps[0].name;
                } else {
                    name = this.SpawnCreep(room);
                }

                if (name != '') {
                    this.jobMemory.AssignedCreep = name;
                    if (!this.ValidateJob()) {
                        break;
                    }
                    result = OK;
                }
            }
            let JobID = this.jobMemory.GetCurCmdType();
            let nextID = this.jobMemory.GetCurNode().GetResponse(Game.creeps[this.jobMemory.AssignedCreep], this.ConstructedArgs['target'], result);
            if (nextID) { // undefined means no custom response, just return the current job.
                if (nextID != JobID) {  // This command is done, move to next
                    this.jobMemory.CurNodeID = nextID;
                    this.jobMemory.AssignedTarget = COMMAND_FIND_TARGET;
                    result = HL_RETRY;   // Run again
                }
                if (nextID == JobID) {
                    break;
                }
                if (nextID == CommandEnd) {
                    this.DeactivateJob();
                }
            } else {
                // Predefined results:
                if (result == ERR_NOT_IN_RANGE) {
                    let creep = Game.creeps[this.jobMemory.AssignedCreep]
                    result = creep.moveTo(this.ConstructedArgs['target']);
                    if (result == ERR_TIRED) {
                        result = OK;
                    }
                }
            }
            if (lastResult == result && result != HL_NEXT_COMMAND) {
                break;
            }

            lastResult = result;
        } while (result != OK && retryCount++ < 5);

        if (retryCount > 5) {
            console.log('Job HAS FAILED: ' + result)
        }
        return result;
    }
}