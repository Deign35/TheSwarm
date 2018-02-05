import { BasicCreepCommandType, AdvancedCreepCommandType, CreepCommandType, SwarmReturnCode, CommandResponseType, C_Attack } from "SwarmEnums";
import * as _ from "lodash";

export class BasicCreepCommand {

    static ExecuteCreepCommand(commandType: CreepCommandType, ling: Creep, args: { [name: string]: any }): SwarmReturnCode {
        switch (commandType) {
            case (BasicCreepCommandType.C_Attack): return ling.attack(args['target']);
            case (BasicCreepCommandType.C_Build): return ling.build(args['target']);
            case (BasicCreepCommandType.C_Dismantle): return ling.dismantle(args['target']);
            case (BasicCreepCommandType.C_Drop): return ling.drop(args['resourceType']);
            case (BasicCreepCommandType.C_Harvest):
                let creepCarryTotal = _.sum(ling.carry as any);
                if (creepCarryTotal == ling.carryCapacity) { return ERR_FULL; }
                return ling.harvest(args['target']);
            case (BasicCreepCommandType.C_Heal): return ling.heal(args['target']);
            case (BasicCreepCommandType.C_Pickup): return ling.pickup(args['target']);
            case (BasicCreepCommandType.C_RangedAttack): return ling.rangedAttack(args['target']);
            case (BasicCreepCommandType.C_RangedHeal): return ling.rangedHeal(args['target']);
            case (BasicCreepCommandType.C_Repair): return ling.repair(args['target']);
            case (BasicCreepCommandType.C_Suicide): return ling.suicide();
            case (BasicCreepCommandType.C_Say): return ling.say(args['message']);
            case (BasicCreepCommandType.C_Transfer): return ling.transfer(args['target'], args['resourceType'], args['amount'] ? args['amount'] : undefined);
            case (BasicCreepCommandType.C_Upgrade): return ling.upgradeController(args['target']);
            case (BasicCreepCommandType.C_Withdraw): return ling.withdraw(args['target'], args['resourceType'], args['amount'] ? args['amount'] : undefined);
        }
        return ERR_INVALID_ARGS;
    }

    static RequiresTarget(commandType: CreepCommandType) {
        return commandType == BasicCreepCommandType.C_Attack ||
            commandType == BasicCreepCommandType.C_Build ||
            commandType == BasicCreepCommandType.C_Harvest ||
            commandType == BasicCreepCommandType.C_Heal ||
            commandType == BasicCreepCommandType.C_Pickup ||
            commandType == BasicCreepCommandType.C_Repair ||
            commandType == BasicCreepCommandType.C_Transfer ||
            commandType == BasicCreepCommandType.C_Upgrade ||
            commandType == BasicCreepCommandType.C_Withdraw;
    }

    static CreateGenericResponseList(commandType: CreepCommandType): { [code: number]: CommandResponseType } {
        let responses: { [code: number]: CommandResponseType } = {};
        switch (commandType) {
            case (BasicCreepCommandType.C_Harvest): {
                responses[ERR_NOT_ENOUGH_RESOURCES] = CommandResponseType.Next;
                responses[ERR_FULL]
                break;
            }
            case (BasicCreepCommandType.C_Dismantle): {
                throw 'Not Configured';
            }
            case (BasicCreepCommandType.C_Heal): {
                throw 'Not Configured';
            }
            case (BasicCreepCommandType.C_RangedAttack): {
                throw 'Not Configured';
            };
            case (BasicCreepCommandType.C_RangedHeal): {
                throw 'Not Configured';
            }
            case (BasicCreepCommandType.C_Suicide): {
                responses[OK] = CommandResponseType.Next;
                break;
            }
            case (BasicCreepCommandType.C_Say): {
                responses[OK] = CommandResponseType.Next;
                break;
            }
            case (BasicCreepCommandType.C_Withdraw): {
                responses[OK] = CommandResponseType.Next;
                break;
            }
        }
        return responses;
    }

    static NOT_FOUND_ID = 'NFI';
    // Load balancing targets here.
    static FindCommandTarget(creep: Creep, commandType: CreepCommandType) {
        let target: RoomObject | undefined;
        switch (commandType) {
            case (BasicCreepCommandType.C_Attack): {
                throw 'Not Configured';
            }
            case (BasicCreepCommandType.C_Build): {
                target = creep.pos.findClosestByRange(FIND_CONSTRUCTION_SITES);
            }
            case (BasicCreepCommandType.C_Harvest): {
                target = creep.pos.findClosestByRange(FIND_SOURCES);
            }
            case (BasicCreepCommandType.C_Heal): {
                throw 'Not Configured';
            }
            case (BasicCreepCommandType.C_Pickup): {
                target = creep.pos.findClosestByRange(FIND_DROPPED_ENERGY);
            }
            case (BasicCreepCommandType.C_Repair): {
                throw 'Not Configured';
            }
            case (BasicCreepCommandType.C_Transfer): {
                let targets = creep.room.find(FIND_STRUCTURES, {
                    filter: function (structure) {
                        return (structure.structureType == STRUCTURE_EXTENSION ||
                            structure.structureType == STRUCTURE_SPAWN ||
                            structure.structureType == STRUCTURE_LINK ||
                            structure.structureType == STRUCTURE_TOWER) &&
                            structure.energy < structure.energyCapacity;
                    }
                });
                if (targets.length > 0) {
                    targets.sort((a, b) => {
                        if (a.structureType == STRUCTURE_TOWER || b.structureType == STRUCTURE_TOWER) {
                            if (a.structureType != b.structureType) {
                                return a.structureType == STRUCTURE_TOWER ? -1 : 1;
                            }
                        }

                        let distA = creep.pos.getRangeTo(a);
                        let distB = creep.pos.getRangeTo(b);
                        return distA < distB ? 1 : (distA > distB ? -1 : 0);
                    });
                    target = targets[0];
                }
                break;
            }
            case (BasicCreepCommandType.C_Upgrade): {
                target = creep.room.controller;
                break;
            }
            case (BasicCreepCommandType.C_Withdraw): {
                throw 'Not Configured';
            }
        }

        return target ? target : ERR_NOT_FOUND;
    }
}