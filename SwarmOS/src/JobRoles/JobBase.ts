import { SwarmMemory } from "Memory/SwarmMemory";
import { CommandWeb } from "Memory/CommandWeb";
import { CommandMemory } from "Memory/CommandMemory";
import { BasicCreepCommand } from "Commands/BasicCreepCommand";
import { CreepCommandType, SwarmReturnCode, HL_REQUIRE_CREEP } from "SwarmEnums";

export abstract class JobBase extends SwarmMemory implements IJob {
    JobCommands: CommandWeb;
    JobData: CommandMemory;

    LastResult: SwarmReturnCode = ERR_INVALID_ARGS;
    abstract InitJob(...inArgs: any[]): void;
    Save() {
        this.JobCommands.Save();
        this.JobData.Save();
        super.Save();
    }

    Load() {
        super.Load();
        this.JobCommands = new CommandWeb('jobCommands', this);
        this.JobData = new CommandMemory('jobArgs', this);
    }

    abstract ValidateArgs(): SwarmReturnCode;

    ProcessJob() {
        let jobResult = this.ValidateArgs();
        if (jobResult == OK) {

        }
        let JobArgs = this.JobData.CommandArgs;
        let creep = Game.creeps[this.JobData.CreepName];
        let JobID = this.JobData.CurCommandID;

        let commandType = this.JobCommands.GetCommandType(JobID) as CreepCommandType;
        let commandResult = BasicCreepCommand.ExecuteCreepCommand(commandType, creep, JobArgs);

        // Process the commandResult against the CommandWeb.
        return OK;
    }
}