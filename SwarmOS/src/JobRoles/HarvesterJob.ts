import { JobBase } from "JobRoles/JobBase";
import { CommandWeb } from "Memory/CommandWeb";
import { BasicCreepCommandType, AdvancedCreepCommandType, CommandType, SwarmReturnCode, HL_REQUIRE_CREEP } from "SwarmEnums";


const HARVEST_COMMAND = 'HC';
const TRANSFER_COMMAND = 'TC';
const FIND_TARGET = 'FT';
export class HarvesterJob extends JobBase {
    ValidateArgs(): SwarmReturnCode {
        if (!this.JobData.CreepName || !Game.creeps[this.JobData.CreepName]) {
            return HL_REQUIRE_CREEP;
        }

        

        return OK;
    }
    SourceTarget: Source;
    Load() {
        super.Load();
        this.SourceTarget = Game.getObjectById(this.GetData('ST')) as Source;
    }
    InitJob(sourceID: string, repeat: boolean) {
        this.SetData('ST', sourceID);
        this.SourceTarget = Game.getObjectById(this.GetData('ST')) as Source;
        let commandTypes: { [commandID: string]: CommandType } = {};
        commandTypes[HARVEST_COMMAND] = BasicCreepCommandType.C_Harvest;
        commandTypes[TRANSFER_COMMAND] = BasicCreepCommandType.C_Transfer;
        commandTypes[FIND_TARGET] = AdvancedCreepCommandType.A_FindTarget; // Make a new action for finding.

        this.JobCommands.SetCommands(commandTypes, repeat ? HARVEST_COMMAND : CommandWeb.EndCommandID);
        this.JobCommands.SetCommandResponse(HARVEST_COMMAND, FIND_TARGET, [
            ERR_FULL,
            ERR_NOT_ENOUGH_RESOURCES
        ]);
        this.JobCommands.SetCommandResponse(TRANSFER_COMMAND, FIND_TARGET, [
            ERR_INVALID_TARGET,
            ERR_NOT_FOUND,
            ERR_FULL,
        ]);
        this.JobCommands.SetCommandResponse(FIND_TARGET, TRANSFER_COMMAND, [
            OK,
        ]);
        if (repeat) {
            this.JobCommands.SetCommandResponse(TRANSFER_COMMAND, HARVEST_COMMAND, [
                ERR_NOT_ENOUGH_RESOURCES,
            ]);
            this.JobCommands.SetCommandResponse(FIND_TARGET, HARVEST_COMMAND, [
                ERR_NOT_FOUND,
                ERR_INVALID_TARGET,
            ])
        }
    }
}