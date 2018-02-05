import { JobBase } from "JobRoles/JobBase";
import { CommandWeb } from "Memory/CommandWeb";
import { CommandType, SwarmReturnCode, HL_REQUIRE_CREEP, AdvancedCreepCommandType, HL_NEXT_COMMAND, CommandResponseType, CommandEnd, C_Transfer, C_Pickup, C_Drop, C_Withdraw, CreepCommandType, GenericResponses, BasicCreepCommandType, HL_RETRY } from "SwarmEnums";
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
        let result = ERR_INVALID_ARGS as SwarmReturnCode;
        if (!this.GetData('active')) {
            result = ERR_BUSY;
        } else {
            result = super.ValidateJob();
        }
        return result;
    }
    ConstructArgs(creep: Creep): SwarmReturnCode {
        let result = OK as SwarmReturnCode;
        let args: Dictionary = {};
        let cmdID = this.JobData.CurCommandID;
        let cmdType = this.JobCommands.GetCommandType(cmdID) as CreepCommandType;
        if(BasicCreepCommand.RequiresTarget(cmdType)) {
            let cmdTarget: any = this.TargetData.GetData(cmdID);  // I HATE ANY
            if(!cmdTarget) {
                cmdTarget = this.JobData.CommandTarget;
            }
            if (cmdTarget == COMMAND_FIND_TARGET) {
                cmdTarget = ERR_NOT_FOUND;
                // Possible way to do targets (for now)
                // Change JobData to accept a target, and have
                // that jobdata handle marking/unmarking targets
                // Check where command args get wiped to ensure we change the target;
                // Add to find, a sort based on the number of targeters.
                let target = BasicCreepCommand.FindCommandTarget(creep, cmdType);
                if((<Structure>target).id) {
                    cmdTarget = (<Structure>target).id;
                    this.JobData.CommandTarget = cmdTarget;
                }
            }

            if(cmdTarget != ERR_NOT_FOUND) {
                let target = Game.getObjectById(cmdTarget);
                if(!target) {
                    this.TargetData.DeleteData(cmdID);
                    this.JobData.CommandTarget = COMMAND_FIND_TARGET;
                    result = HL_RETRY;
                } else {
                    args['target'] = target;
                }
            } else {
                result = ERR_NOT_FOUND;
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
        let creepBody = this.JobData.GetData('BODY');
        let testSpawn = spawn.spawnCreep(creepBody, 'TESTSpawn', {dryRun: true});
        if (testSpawn == OK) {
            newName = spawn.room.name + '_';
            newName += this.MemoryID.slice(-3) + '_';
            newName += ('' + Game.time).slice(-4);
            spawn.spawnCreep(creepBody, newName);
            Game.spawns[spawnName].lastSpawnTick = Game.time;
        }
        return newName;
    }

    AddCommand(commandType: CreepCommandType, target?: string) {
        let lastCommand = this.JobCommands.GetData(LAST_COMMAND) || [];
        let count = (lastCommand && lastCommand[2]) || 0;
        let newCommand = '#' + count;
        if (target) {
            this.TargetData.SetData(newCommand, target);
        }
        if (count == 0) {
            let newLinksList = {} as { [id: string]: CreepCommandType };
            newLinksList[newCommand] = commandType;
            this.JobData.CurCommandID = newCommand;
            this.JobData.CommandTarget = target ? target : COMMAND_FIND_TARGET;
            this.JobCommands.SetCommands(newLinksList, newCommand);
            this.JobCommands.SetData(LAST_COMMAND, [newCommand, commandType, count + 1]);
            return;
        }
        this.JobCommands.AddCommand(newCommand, commandType);

        let responseList = BasicCreepCommand.CreateGenericResponseList(lastCommand[1]);
        //Hook em up!
        this.JobCommands.SetCommandResponse(lastCommand[0], newCommand, this.GetResponsesForType(CommandResponseType.Next, responseList));
        this.JobCommands.SetCommandResponse(lastCommand[0], lastCommand[0], this.GetResponsesForType(CommandResponseType.Self, responseList));
        this.JobCommands.SetCommandComplete(lastCommand[0], this.GetResponsesForType(CommandResponseType.Terminate, responseList));
        this.JobCommands.SetCommandResponse(lastCommand[0], newCommand, this.GetResponsesForType(CommandResponseType.Restart, responseList));
        this.JobCommands.SetData(LAST_COMMAND, [newCommand, commandType, count + 1]);
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
        if(!repeat) {
            this.AddCommand(BasicCreepCommandType.C_Suicide);
        }
        this.SetData('active', true);
        let lastCmdData = this.JobCommands.GetData(LAST_COMMAND);
        let responseList = BasicCreepCommand.CreateGenericResponseList(lastCmdData[1]);
        //Hook em up!
        let lastCommnd = repeat ? this.JobCommands.DefaultCommand : CommandEnd;
        this.JobCommands.SetCommandResponse(lastCmdData[0], lastCommnd, this.GetResponsesForType(CommandResponseType.Next, responseList));
        this.JobCommands.SetCommandResponse(lastCmdData[0], lastCmdData[0], this.GetResponsesForType(CommandResponseType.Self, responseList));
        this.JobCommands.SetCommandComplete(lastCmdData[0], this.GetResponsesForType(CommandResponseType.Terminate, responseList));
        this.JobCommands.SetCommandResponse(lastCmdData[0], lastCommnd, this.GetResponsesForType(CommandResponseType.Restart, responseList));
        this.JobCommands.DeleteData(LAST_COMMAND);

        let defaultResponses = GenericResponses;
        this.JobCommands.SetCommandResponse(lastCmdData[0], lastCommnd, this.GetResponsesForType(CommandResponseType.Next, defaultResponses));
        this.JobCommands.SetCommandResponse(lastCmdData[0], lastCommnd, this.GetResponsesForType(CommandResponseType.Restart, defaultResponses));

        if(!this.JobData.GetData('BODY')) {
            this.SetSpawnBody({
                move: 1,
                carry: 1
            })
        }
    }

    SetSpawnBody(bodyParts: {[partType: string]: number }) {
        let parts = [];
        for(let partType in bodyParts) {
            let count = bodyParts[partType];
            let partName = partType.toLowerCase();
            for(let i = 0; i < count; i++) {
                parts.push(partName);
            }
        }

        this.JobData.SetData('BODY', parts);
    }

    DeactivateJob() {
        this.DeleteData('active');
    }
}