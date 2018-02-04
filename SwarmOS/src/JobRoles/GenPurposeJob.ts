import { JobBase } from "JobRoles/JobBase";
import { CommandWeb } from "Memory/CommandWeb";
import { CommandType, SwarmReturnCode, HL_REQUIRE_CREEP, BasicCreepCommandType, AdvancedCreepCommandType, HL_NEXT_COMMAND, CommandResponseType, CommandEnd, C_Transfer, C_Pickup, C_Drop, C_Withdraw } from "SwarmEnums";
import { BasicCreepCommand } from "Commands/BasicCreepCommand";
import { SwarmMemory } from "Memory/SwarmMemory";

const LAST_COMMAND = 'L#';
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
        let cmdTarget = this.TargetData.GetData(cmdID);
        if (cmdTarget) {
            args['target'] = Game.getObjectById(cmdTarget);
        }
        let cmdType = this.JobCommands.GetCommandType(cmdID);
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

    AddCommand(commandType: BasicCreepCommandType, target: string) {
        let lastCommand = this.JobCommands.GetData(LAST_COMMAND) || [];
        let count = (lastCommand && lastCommand[2]) || 0;
        let newCommand = '#' + count;
        if (count == 0) {
            let newLinksList = {} as { [id: string]: BasicCreepCommandType };
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

        this.TargetData.SetData(newCommand, target);
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

    InitJob() {
        this.SetData('active', true);
    }
}