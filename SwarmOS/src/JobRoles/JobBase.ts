import { SwarmMemory } from "Memory/SwarmMemory";
import { CommandWeb } from "Memory/CommandWeb";
import { CommandMemory } from "Memory/CommandMemory";
import { BasicCreepCommand } from "Commands/BasicCreepCommand";
import { CreepCommandType, SwarmReturnCode, HL_REQUIRE_CREEP, HL_NEXT_COMMAND, HL_RETRY } from "SwarmEnums";

export abstract class JobBase extends SwarmMemory implements IJob {
    JobCommands: CommandWeb;
    JobData: CommandMemory;

    ConstructedArgs: Dictionary;
    abstract InitJob(...inArgs: any[]): void;
    abstract ConstructArgs(creep: Creep): SwarmReturnCode;
    abstract SpawnCreep(room: Room): string;

    ValidateJob(): SwarmReturnCode {
        if (!this.JobData.CreepName || !Game.creeps[this.JobData.CreepName]) {
            return HL_REQUIRE_CREEP;
        }

        return OK;
    }
    Save() {
        this.JobCommands.Save();
        this.JobData.Save();
        super.Save();
    }

    Load() {
        super.Load();
        this.JobCommands = new CommandWeb('jobCommands', this);
        this.JobData = new CommandMemory('jobData', this);
    }

    ProcessJob(): SwarmReturnCode {
        let JobID = this.JobCommands.DefaultCommand;
        let jobResult = this.ValidateJob();
        if (jobResult == OK) {
            let creep = Game.creeps[this.JobData.CreepName];
            JobID = this.JobData.CurCommandID;
            jobResult = this.ConstructArgs(creep);
            if (jobResult == OK) {
                let commandType = this.JobCommands.GetCommandType(JobID) as CreepCommandType
                jobResult = BasicCreepCommand.ExecuteCreepCommand(commandType, creep, this.ConstructedArgs);
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
            if (result == HL_REQUIRE_CREEP) { // Look for an existing creep that is unassigned
                let name = this.SpawnCreep(room);
                if (name != '') {
                    this.JobData.CreepName = name;
                    if (!this.ValidateJob()) {
                        break;
                    }
                    result = OK;
                }
            }
            let JobID = this.JobData.CurCommandID;
            let nextID = this.JobCommands.GetCommandResult(JobID, result);
            if (nextID) { // undefined means no custom response, just return the current job.
                if (nextID != JobID) {  // This command is done, move to next
                    //console.log('Job[' + this.MemoryID + ']: Updating job from (' + JobID + ') to (' + nextID + ') @ ' + Game.time);
                    if (result != HL_NEXT_COMMAND) {
                        this.JobData.CommandArgs = {}; // Clear args
                    }
                    this.JobData.CurCommandID = nextID; // Set next command
                    result = HL_RETRY;   // Run again
                }
                if (nextID == JobID) {
                    break;
                }
            } else {
                // Predefined results:
                if (result == ERR_NOT_IN_RANGE) {
                    let creep = Game.creeps[this.JobData.CreepName]
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

        console.log('R: ' + result);
        return result;
    }
}