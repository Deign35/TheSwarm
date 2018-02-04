import { SwarmMemory } from "Memory/SwarmMemory";
import { CommandWeb } from "Memory/CommandWeb";
import { CommandMemory } from "Memory/CommandMemory";
import { BasicCreepCommand } from "Commands/BasicCreepCommand";
import { CreepCommandType, SwarmReturnCode, HL_REQUIRE_CREEP, HL_NEXT_COMMAND, HL_RETRY } from "SwarmEnums";

export abstract class JobBase extends SwarmMemory implements IJob {
    JobCommands: CommandWeb;
    JobData: CommandMemory;

    ConstructedArgs: Dictionary;
    LastResult: SwarmReturnCode = ERR_INVALID_ARGS;
    abstract InitJob(spawn: StructureSpawn, ...inArgs: any[]): void;
    abstract ConstructArgs(): SwarmReturnCode;
    abstract SpawnCreep(): string;

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
            JobID = this.JobData.CurCommandID;
            jobResult = this.ConstructArgs();
            if (jobResult == OK) {
                let creep = Game.creeps[this.JobData.CreepName];
                let commandType = this.JobCommands.GetCommandType(JobID) as CreepCommandType
                jobResult = BasicCreepCommand.ExecuteCreepCommand(commandType, creep, this.ConstructedArgs);
            }
        }

        let nextID = this.JobCommands.GetCommandResult(JobID, jobResult);
        if(nextID) { // undefined means no custom response, just return the current job.
            if (nextID != JobID) {  // This command is done, move to next
                //console.log('Job[' + this.MemoryID + ']: Updating job from (' + JobID + ') to (' + nextID + ') @ ' + Game.time);
                if(jobResult != HL_NEXT_COMMAND) {
                    this.JobData.CommandArgs = {}; // Clear args
                }
                this.JobData.CurCommandID = nextID; // Set next command
                jobResult = HL_RETRY;   // Run again
            }
            if (nextID == JobID) {
                jobResult = OK; // Same command, OK is fine.
            }
        } else {
            // Predefined results:
            if(jobResult == ERR_NOT_IN_RANGE) {
                let creep = Game.creeps[this.JobData.CreepName]
                jobResult = creep.moveTo(this.ConstructedArgs['target']);
            }
        }
        if(this.LastResult == jobResult && jobResult != HL_NEXT_COMMAND) {

        //if (this.LastResult == HL_REQUIRE_CREEP && jobResult == HL_REQUIRE_CREEP) {
            // We did not aquire a creep.
            jobResult = OK;
        }
        return jobResult;
    }
}