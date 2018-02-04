import { JobBase } from "JobRoles/JobBase";
import { CommandWeb } from "Memory/CommandWeb";
import { CommandType, SwarmReturnCode, HL_REQUIRE_CREEP, BasicCreepCommandType, AdvancedCreepCommandType, HL_NEXT_COMMAND } from "SwarmEnums";

const HARVEST_COMMAND = 'HC';
const TRANSFER_COMMAND = 'TC';
const FIND_TARGET = 'FT';

const TRANSFER_TARGET = 'TT';
const SOURCE_TARGET = 'ST';
export class HarvesterJob extends JobBase {
    ValidateJob(): SwarmReturnCode {
        let validationResult = super.ValidateJob();
        if (this.JobData.CurCommandID == HARVEST_COMMAND && validationResult == OK) {
            const creep = Game.creeps[this.JobData.CreepName];
            validationResult = creep.carry.energy < creep.carryCapacity ? OK : ERR_FULL;
        }

        return validationResult;
    }
    ConstructArgs(creep: Creep): SwarmReturnCode {
        let result = OK as SwarmReturnCode;
        let args: Dictionary = {};
        switch (this.JobData.CurCommandID) {
            case (HARVEST_COMMAND): {
                args['target'] = Game.getObjectById(this.GetData(SOURCE_TARGET));
                break;
            }
            case (TRANSFER_COMMAND): {
                args['target'] = Game.getObjectById(this.JobData.GetData(TRANSFER_TARGET));
                args['resourceType'] = RESOURCE_ENERGY;
                break;
            }
            case (FIND_TARGET): {
                let creep = Game.creeps[this.JobData.CreepName];
                let targets = creep.room.find(FIND_STRUCTURES, {
                    filter: function (structure) {
                        return (structure.structureType == STRUCTURE_EXTENSION ||
                            structure.structureType == STRUCTURE_SPAWN ||
                            structure.structureType == STRUCTURE_LINK ||
                            structure.structureType == STRUCTURE_TOWER) &&
                            structure.energy < structure.energyCapacity;
                    }
                });

                // Sort targets
                if (targets.length == 0) {
                    result = ERR_NOT_FOUND;
                } else {
                    this.JobData.SetData(TRANSFER_TARGET, targets[0].id);
                    result = HL_NEXT_COMMAND;
                }
                break;
            }
        }

        this.ConstructedArgs = args;
        return result;
    }

    SpawnCreep(room: Room): string {
        let newName = '';
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

    InitJob(sourceID: string, repeat: boolean) {
        this.JobData.CurCommandID = HARVEST_COMMAND;
        this.SetData(SOURCE_TARGET, sourceID);
        let commandTypes: { [commandID: string]: CommandType } = {};
        commandTypes[HARVEST_COMMAND] = BasicCreepCommandType.C_Harvest;
        commandTypes[TRANSFER_COMMAND] = BasicCreepCommandType.C_Transfer;
        commandTypes[FIND_TARGET] = AdvancedCreepCommandType.A_FindTarget;

        this.JobCommands.SetCommands(commandTypes, repeat ? HARVEST_COMMAND : CommandWeb.EndCommandID);
        this.JobCommands.SetCommandResponse(HARVEST_COMMAND, FIND_TARGET, [
            ERR_FULL,
            ERR_NOT_ENOUGH_RESOURCES,
            HL_NEXT_COMMAND,
        ]);
        this.JobCommands.SetCommandResponse(TRANSFER_COMMAND, FIND_TARGET, [
            ERR_INVALID_TARGET,
            ERR_NOT_FOUND,
            ERR_FULL,
            HL_NEXT_COMMAND,
        ]);
        this.JobCommands.SetCommandResponse(FIND_TARGET, TRANSFER_COMMAND, [
            HL_NEXT_COMMAND,
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