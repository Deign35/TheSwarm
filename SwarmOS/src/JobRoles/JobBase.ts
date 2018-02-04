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
        let jobResult = this.ValidateJob();
        if (jobResult == OK) {
            jobResult = this.ConstructArgs();
            if (jobResult == OK) {
                let creep = Game.creeps[this.JobData.CreepName];
                let JobID = this.JobData.CurCommandID;

                let commandType = this.JobCommands.GetCommandType(JobID) as CreepCommandType
                jobResult = BasicCreepCommand.ExecuteCreepCommand(commandType, creep, this.ConstructArgs);

                let nextID = this.JobCommands.GetCommandResult(JobID, jobResult);
                // Compare nextID with JobID;
                if (nextID != JobID) {
                    this.JobData.CommandArgs = {};
                    this.JobData.CurCommandID = nextID;
                    jobResult = HL_RETRY;
                }
                if (nextID == JobID) {
                    jobResult = OK;
                }
            }
        } else if (this.LastResult == HL_REQUIRE_CREEP && jobResult == HL_REQUIRE_CREEP) {
            // We did not aquire a creep.
            jobResult = OK;
        }

        return jobResult;
    }
}