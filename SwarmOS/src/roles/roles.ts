

import { RoleBuilder } from './builder';
import { RoleDeliverer } from './deliverer';
import { RoleHarvester } from './harvester';
import { RoleHarvester2 } from './harvester2';
import { RoleMiner } from './miner';
import { RoleRepairer } from './repairer';
import { RoleScientist } from './scientist';
import { RoleSweeper } from './sweeper';
import { RoleUpgrader } from './upgrader';
import * as _ from 'lodash';

export class Role {
    static RoleConstructor() {
        Role.Roles[RoleBuilder.roleId] = RoleBuilder;
        Role.Roles[RoleDeliverer.roleId] = RoleDeliverer;
        Role.Roles[RoleHarvester.roleId] = RoleHarvester;
        Role.Roles[RoleHarvester2.roleId] = RoleHarvester2;
        Role.Roles[RoleMiner.roleId] = RoleMiner;
        Role.Roles[RoleRepairer.roleId] = RoleRepairer;
        Role.Roles[RoleScientist.roleId] = RoleScientist;
        Role.Roles[RoleSweeper.roleId] = RoleSweeper;
        Role.Roles[RoleUpgrader.roleId] = RoleUpgrader;
    }
    static Roles: {[name: string]: any } = {};

    static run(creep: Creep) {
        let hr = 0;
        if(!Memory['Roles']) Memory['Roles'] = {} as {[name: string]: any};
        try {
            hr = this.Roles[creep.memory['role']].run(creep);
        } catch(e) {
            hr = ERR_INVALID_ARGS;
        }

        if(hr == ERR_NOT_IN_RANGE) {
            hr = creep.moveByPath(creep.memory['movePath']);
            if(hr == ERR_NOT_FOUND || hr == ERR_INVALID_ARGS) {
                creep.memory['movePath'] = creep.pos.findPathTo(this.Roles[creep.memory['role']].GetTarget(creep), {
                    ignoreCreeps: true,
                    maxRooms: 1,
                    serialize: true,
                 });
                 hr = creep.moveByPath(creep.memory['movePath']);
            }
        }

        if(hr != OK && hr != ERR_NOT_IN_RANGE) {
            //this.Roles[RoleBuilder.roleId].run(creep);

            console.log('Role failed with error: ' + hr);
        }
    }

    static trySpawn() {
        try {
            let maxEnergy = 0;
            let allEnergyStructures = Game.rooms['E22N32'].find(FIND_MY_STRUCTURES, (structure) => structure.structureType == STRUCTURE_SPAWN ||
                                                                                                   structure.structureType == STRUCTURE_EXTENSION) as StructureExtension[];
            allEnergyStructures.forEach((structure) => maxEnergy += structure.energy);
            for(let i = 0, length = this.Roles.length; i < length; i++) {
                let role = this.Roles[i];
                let creepCount = _.filter(Game.creeps, (creep) => creep.memory.roleId == role.roleId);
                let spawner = role.GetSpawner ? Game.spawns[role.GetSpawner()] : Game.spawns['Spawn2'];
                if(creepCount < role.maxWorkers && spawner.spawnCreep(role.minBody, 'newWorker', { dryRun: true}) == OK) {
                    if(spawner) {
                        let bodyCost = 0;    // get total possible energy;
                        let newBody = role.desiredBody.slice();
                        for(let i = 0, length = newBody.length; i < length; i++) {
                            let bodyPart = newBody[i];
                            bodyCost += BODYPART_COST[newBody[i] as BodyPartConstant];
                        }

                        while(bodyCost > maxEnergy) {
                            newBody = newBody.slice(-1);
                            bodyCost -= BODYPART_COST[role.desiredBody[newBody.length] as BodyPartConstant];
                        }

                        Game.spawns['Spawn2'].spawnCreep(newBody, ('' + Game.time).slice(-5), {memory: {
                            role: role.roleId,
                        }})
                        return;
                    }
                }
            }
        } catch(e) {
            console.log('crashed during spawning phase');
        }
    }
}

Role.RoleConstructor();