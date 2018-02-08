import * as SwarmEnums from "SwarmEnums";
import * as _ from "lodash";

let BasicCreepCommandType = SwarmEnums.BasicCreepCommandType;
let DefaultOverrides: { [commandType: string]: { [result: number]: SwarmEnums.CommandResponseType } } = {};
DefaultOverrides[BasicCreepCommandType.C_Harvest] = {};
DefaultOverrides[BasicCreepCommandType.C_Harvest][OK] = SwarmEnums.CRT_Condition_Full;
DefaultOverrides[BasicCreepCommandType.C_Harvest][ERR_NOT_ENOUGH_RESOURCES] = SwarmEnums.CRT_Retry;
DefaultOverrides[BasicCreepCommandType.C_Harvest][ERR_FULL] = SwarmEnums.CRT_Next;

DefaultOverrides[BasicCreepCommandType.C_Withdraw] = {};
DefaultOverrides[BasicCreepCommandType.C_Withdraw][OK] = SwarmEnums.CRT_Condition_Full;
DefaultOverrides[BasicCreepCommandType.C_Withdraw][ERR_NOT_ENOUGH_RESOURCES] = SwarmEnums.CRT_Retry;
DefaultOverrides[BasicCreepCommandType.C_Withdraw][ERR_FULL] = SwarmEnums.CRT_Next;

DefaultOverrides[BasicCreepCommandType.C_Transfer] = {};
DefaultOverrides[BasicCreepCommandType.C_Transfer][OK] = SwarmEnums.CRT_Condition_Empty;
DefaultOverrides[BasicCreepCommandType.C_Transfer][ERR_NOT_ENOUGH_RESOURCES] = SwarmEnums.CRT_Next;
DefaultOverrides[BasicCreepCommandType.C_Transfer][ERR_FULL] = SwarmEnums.CRT_Retry;
export class BasicCreepCommand {

    static ExecuteCreepCommand(commandType: SwarmEnums.BasicCreepCommandType, ling: Creep, args: { [name: string]: any }): SwarmEnums.SwarmReturnCode {
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

    static RequiresTarget(commandType: SwarmEnums.BasicCreepCommandType) {
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

    static GetResponse(commandType: SwarmEnums.BasicCreepCommandType, result: SwarmEnums.SwarmReturnCode) {
        if (DefaultOverrides[commandType] && DefaultOverrides[commandType][result]) {
            return DefaultOverrides[commandType][result];
        }
        switch (result) {
            case (ERR_NOT_IN_RANGE):/* -9 */ return SwarmEnums.CRT_Move;
            case (OK):/* 0 */
            case (ERR_NO_PATH):/* -2 */
            case (ERR_NOT_FOUND):/* -5 */
            case (ERR_INVALID_TARGET):/* -7 */ return SwarmEnums.CRT_Next;
            case (ERR_INVALID_ARGS):/* -10 */ return SwarmEnums.CRT_Restart;

            case (ERR_NO_BODYPART):/* -12 */
            case (ERR_NOT_OWNER):/* -1 */
            case (ERR_RCL_NOT_ENOUGH):/* -14 */
            case (ERR_GCL_NOT_ENOUGH):/* -15 */ return SwarmEnums.CRT_Terminate;

            case (ERR_NOT_ENOUGH_RESOURCES):/* -6 */
            case (ERR_FULL):/* -8 */ return SwarmEnums.CRT_Retry;
            //case(ERR_NAME_EXISTS):/* -3 */ break;
            //case(ERR_BUSY):/* -4 */ break;
            //case(ERR_TIRED):/* -11 */ break;
        }

        return SwarmEnums.CRT_None;
    }
    /*static CreateGenericResponseList(commandType: CreepCommandType): { [code: number]: CommandResponseType } {
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
     }*/

    // Load balancing targets here.
    static FindCommandTarget(creep: Creep, commandType: SwarmEnums.BasicCreepCommandType) {
        let possibleTargets: any[] = [];
        let sortFunc = (a: any, b: any) => {
            let countA = Memory.TargetData[a.id] || 1;
            if (Memory.TargetMax[a.id] && countA > Memory.TargetMax[a.id]) {
                return 1;
            }
            if (Memory.TargetFactor[a.id]) {
                countA *= Memory.TargetFactor[a.id];
            }
            let countB = Memory.TargetData[b.id] || 1;
            if (Memory.TargetMax[b.id] && countB > Memory.TargetMax[b.id]) {
                return -1;
            }
            if (Memory.TargetFactor[b.id]) {
                countB *= Memory.TargetFactor[b.id];
            }
            if (countA > countB) {
                return 1
            } else if (countA < countB) {
                return -1;
            }
            let distA = creep.pos.getRangeTo(a);
            let distB = creep.pos.getRangeTo(b);
            return distA < distB ? -1 : (distA > distB ? 1 : 0);
        }
        switch (commandType) {
            case (BasicCreepCommandType.C_Attack): {
                throw 'Not Configured';
            }
            case (BasicCreepCommandType.C_Build): {
                possibleTargets = creep.room.find(FIND_MY_CONSTRUCTION_SITES);
                break;
            }
            case (BasicCreepCommandType.C_Harvest): {
                possibleTargets = creep.room.find(FIND_SOURCES);
                break;
            }
            case (BasicCreepCommandType.C_Heal): {
                throw 'Not Configured';
            }
            case (BasicCreepCommandType.C_Pickup): {
                possibleTargets = creep.room.find(FIND_DROPPED_RESOURCES, {
                    filter: function (dropped) {
                        return dropped.resourceType == RESOURCE_ENERGY;
                    }
                });
                break;
            }
            case (BasicCreepCommandType.C_Repair): {
                possibleTargets = creep.room.find(FIND_STRUCTURES, {
                    filter: function (structure) {
                        if (structure.hits == structure.hitsMax) {
                            return false;
                        }
                        // Returning true on road = stops working...
                        if (structure.structureType == STRUCTURE_WALL ||
                            structure.structureType == STRUCTURE_ROAD ||
                            structure.structureType == STRUCTURE_CONTAINER ||
                            structure.structureType == STRUCTURE_RAMPART) {
                            return false;
                        } else if (!(structure as OwnedStructure).my) {
                            return false;
                        }
                        return true;
                    }
                });
                break;
            }
            case (BasicCreepCommandType.C_Transfer): {
                possibleTargets = creep.room.find(FIND_STRUCTURES, {
                    filter: function (structure) {
                        return (structure.structureType == STRUCTURE_EXTENSION ||
                            structure.structureType == STRUCTURE_SPAWN ||
                            structure.structureType == STRUCTURE_LINK ||
                            structure.structureType == STRUCTURE_TOWER) &&
                            structure.energy < structure.energyCapacity;
                    }
                });
                sortFunc = (a: any, b: any) => {
                    if (a.structureType == STRUCTURE_TOWER || b.structureType == STRUCTURE_TOWER) {
                        if (a.structureType != b.structureType) {
                            return a.structureType == STRUCTURE_TOWER ? 1 : -1;
                        }
                    }
                    let countA = Memory.TargetData[a.id] || 0;
                    let countB = Memory.TargetData[b.id] || 0;
                    if (countA > countB) {
                        return 1
                    } else if (countA < countB) {
                        return -1;
                    }
                    let distA = creep.pos.getRangeTo(a);
                    let distB = creep.pos.getRangeTo(b);
                    return distA < distB ? -1 : (distA > distB ? 1 : 0);
                }
                break;
            }
            case (BasicCreepCommandType.C_Upgrade):
                if (creep.room.controller) {
                    possibleTargets.push(creep.room.controller);
                }
                break;
            case (BasicCreepCommandType.C_Withdraw): {
                throw 'Not Configured';
            }
        }

        let target: Structure | ERR_NOT_FOUND = ERR_NOT_FOUND; // This is hacky.  It could be all sorts of other things
        // lucky that I am only using the ID.  If I use something else, this will need to be fixed.
        if (possibleTargets.length > 0) {
            possibleTargets.sort(sortFunc);
            target = possibleTargets[0];
        }
        return target != ERR_NOT_FOUND ? target.id : ERR_NOT_FOUND;
    }
}