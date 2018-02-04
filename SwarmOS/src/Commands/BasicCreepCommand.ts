import { BasicCreepCommandType, AdvancedCreepCommandType, CreepCommandType, SwarmReturnCode, CommandResponseType } from "SwarmEnums";
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

    static CreateGenericResponseList(commandType: CreepCommandType): { [code: number]: CommandResponseType } {
        let responses: { [code: number]: CommandResponseType } = {};
        switch (commandType) {
            case (BasicCreepCommandType.C_Harvest): {
                responses[ERR_NOT_ENOUGH_RESOURCES] = CommandResponseType.Next;
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
}