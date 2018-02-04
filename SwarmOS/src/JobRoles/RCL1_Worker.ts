import { JobBase } from "JobRoles/JobBase";
import { CommandWeb } from "Memory/CommandWeb";
import { CommandType, SwarmReturnCode, HL_REQUIRE_CREEP, BasicCreepCommandType, AdvancedCreepCommandType, HL_NEXT_COMMAND } from "SwarmEnums";

const HARVEST_COMMAND = 'C_H';
const UPGRADE_COMMAND = 'C_U';

const SOURCE_TARGET = 'T_S';
export class RCL1_Worker extends JobBase {
    ValidateJob(): SwarmReturnCode {
        let validationResult = super.ValidateJob();
        if(this.JobData.CurCommandID == HARVEST_COMMAND && validationResult == OK) {
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
                args['target'] = creep.pos.findClosestByRange(FIND_SOURCES);
                break;
            }
            case (UPGRADE_COMMAND): {
                args['target'] = creep.room.controller;
                args['resourceType'] = RESOURCE_ENERGY;
                break;
            }
        }

        this.ConstructedArgs = args;
        return result;
    }

    SpawnCreep(room: Room): string {
        let newName = '';
        let spawners = room.find(FIND_MY_SPAWNS);
        if(spawners.length == 0) { return newName }
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

    InitJob() {
        this.JobData.CurCommandID = HARVEST_COMMAND;
        let commandTypes: { [commandID: string]: CommandType } = {};
        commandTypes[HARVEST_COMMAND] = BasicCreepCommandType.C_Harvest;
        commandTypes[UPGRADE_COMMAND] = BasicCreepCommandType.C_Upgrade;

        this.JobCommands.SetCommands(commandTypes, HARVEST_COMMAND);
        this.JobCommands.SetCommandResponse(HARVEST_COMMAND, UPGRADE_COMMAND, [
            ERR_FULL,
            ERR_NOT_ENOUGH_RESOURCES,
            HL_NEXT_COMMAND,
        ]);
        this.JobCommands.SetCommandResponse(UPGRADE_COMMAND, HARVEST_COMMAND, [
            ERR_INVALID_TARGET,
            ERR_NOT_ENOUGH_RESOURCES,
            HL_NEXT_COMMAND,
        ]);
    }
}