import { JobBase } from "JobRoles/JobBase";
import { CommandWeb } from "Memory/CommandWeb";
import { CommandType, SwarmReturnCode, HL_REQUIRE_CREEP, AdvancedCreepCommandType, HL_NEXT_COMMAND, CommandResponseType, CommandEnd, C_Transfer, C_Pickup, C_Drop, C_Withdraw, CreepCommandType } from "SwarmEnums";
import { BasicCreepCommand } from "Commands/BasicCreepCommand";
import { SwarmMemory } from "Memory/SwarmMemory";

const LAST_COMMAND = 'L#';
const COMMAND_FIND_TARGET = 'CFT';
export class GenPurposeJob extends JobBase {
    TargetData: SwarmMemory;

    Save() {
        this.TargetData.Save();
        super.Save();
    }
    Load() {
        super.Load();
        this.TargetData = new SwarmMemory('TargetData', this);
    }

    ValidateJob() {
        let result = super.ValidateJob();
        if (!result && !this.GetData('active')) {
            result = ERR_BUSY;
        }
        return result;
    }
    ConstructArgs(creep: Creep): SwarmReturnCode {
        let result = OK as SwarmReturnCode;
        let args: Dictionary = {};
        let cmdID = this.JobData.CurCommandID;
        let cmdType = this.JobCommands.GetCommandType(cmdID) as CreepCommandType;
        let cmdTarget = this.TargetData.GetData(cmdID);
        if (cmdTarget) {
            let target: RoomObject | ERR_NOT_FOUND = creep;
            if (cmdTarget == COMMAND_FIND_TARGET) {
                target = BasicCreepCommand.FindCommandTarget(creep, cmdType);
                if (target == ERR_NOT_FOUND) {
                    result = ERR_NOT_FOUND;
                } else {
                    args['target'] = target;
                }
            } else {
                target = Game.getObjectById(cmdTarget) as RoomObject;
                args['target'] = target;
            }
        }
        if (cmdType == C_Transfer ||
            cmdType == C_Pickup ||
            cmdType == C_Drop ||
            cmdType == C_Withdraw) {
            args['resourceType'] = RESOURCE_ENERGY;
        }

        this.ConstructedArgs = args;
        return result;
    }

    SpawnCreep(room: Room): string {
        let newName = '';
        let spawners = room.find(FIND_MY_SPAWNS);
        if (spawners.length == 0) { return newName }
        let spawnName = room.find(FIND_MY_SPAWNS)[0].name;
        let spawn = Game.spawns[spawnName];
        if (spawn.lastSpawnTick && spawn.lastSpawnTick == Game.time) { return newName; }
        if (spawn.spawnCreep([MOVE, CARRY, WORK], 'TestWorker', { dryRun: true }) == OK) {
            newName = spawn.room.name + '_';
            newName += this.MemoryID.slice(-3) + '_';
            newName += ('' + Game.time).slice(-4);
            spawn.spawnCreep([MOVE, CARRY, WORK], newName);
            Game.spawns[spawnName].lastSpawnTick = Game.time;
        }
        return newName;
    }

    AddCommand(commandType: CreepCommandType, target?: string) {
        let lastCommand = this.JobCommands.GetData(LAST_COMMAND) || [];
        let count = (lastCommand && lastCommand[2]) || 0;
        let newCommand = '#' + count;
        if (count == 0) {
            let newLinksList = {} as { [id: string]: CreepCommandType };
            newLinksList[newCommand] = commandType;
            this.JobCommands.SetCommands(newLinksList, newCommand);
        }
        this.JobCommands.AddCommand(newCommand, commandType);

        let responseList = BasicCreepCommand.CreateGenericResponseList(lastCommand[1]);
        //Hook em up!
        this.JobCommands.SetCommandResponse(lastCommand[0], newCommand, this.GetResponsesForType(CommandResponseType.Next, responseList));
        this.JobCommands.SetCommandResponse(lastCommand[0], lastCommand[0], this.GetResponsesForType(CommandResponseType.Self, responseList));
        this.JobCommands.SetCommandComplete(lastCommand[0], this.GetResponsesForType(CommandResponseType.Terminate, responseList));
        this.JobCommands.SetCommandResponse(lastCommand[0], this.JobCommands.DefaultCommand, this.GetResponsesForType(CommandResponseType.Restart, responseList));
        this.JobCommands.SetData(LAST_COMMAND, [newCommand, commandType, count + 1]);

        if (target) {
            this.TargetData.SetData(newCommand, target);
        } else {
            if (BasicCreepCommand.RequiresTarget(commandType)) {
                this.TargetData.SetData(newCommand, COMMAND_FIND_TARGET);
            }
        }
    }

    GetResponsesForType(responseType: CommandResponseType, responseList: { [id: number]: CommandResponseType }): number[] {
        let responses: number[] = [];
        for (let id in responseList) {
            if (responseList[id] == responseType) {
                responses.push(+id);
            }
        }
        return responses;
    }

    InitJob(repeat: boolean) {
        this.SetData('active', true);
        let lastCmdData = this.JobCommands.GetData(LAST_COMMAND);
        let responseList = BasicCreepCommand.CreateGenericResponseList(lastCmdData[1]);
        //Hook em up!
        this.JobCommands.SetCommandResponse(lastCmdData[0], this.JobCommands.DefaultCommand, this.GetResponsesForType(CommandResponseType.Next, responseList));
        this.JobCommands.SetCommandResponse(lastCmdData[0], lastCmdData[0], this.GetResponsesForType(CommandResponseType.Self, responseList));
        this.JobCommands.SetCommandComplete(lastCmdData[0], this.GetResponsesForType(CommandResponseType.Terminate, responseList));
        this.JobCommands.SetCommandResponse(lastCmdData[0], this.JobCommands.DefaultCommand, this.GetResponsesForType(CommandResponseType.Restart, responseList));
        this.JobCommands.DeleteData(LAST_COMMAND);
    }
}