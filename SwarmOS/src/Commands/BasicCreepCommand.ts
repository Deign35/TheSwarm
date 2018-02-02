import { Swarmling } from "SwarmTypes/Swarmling";
import { ShortCommand } from "Commands/CommandBase";

let DefaultCreepReactions: { [key: number]: e_CreepResponse } = {};
DefaultCreepReactions[OK] = e_CreepResponse.Continue;
DefaultCreepReactions[ERR_NOT_OWNER] = e_CreepResponse.Throw;
DefaultCreepReactions[ERR_NAME_EXISTS] = e_CreepResponse.Throw;
DefaultCreepReactions[ERR_BUSY] = e_CreepResponse.Continue;
DefaultCreepReactions[ERR_NOT_FOUND] = e_CreepResponse.RequireTarget;
DefaultCreepReactions[ERR_NOT_ENOUGH_RESOURCES] = e_CreepResponse.Complete;
DefaultCreepReactions[ERR_INVALID_TARGET] = e_CreepResponse.RequireTarget;
DefaultCreepReactions[ERR_FULL] = e_CreepResponse.Complete;
DefaultCreepReactions[ERR_NOT_IN_RANGE] = e_CreepResponse.Move;
DefaultCreepReactions[ERR_INVALID_ARGS] = e_CreepResponse.Throw;
DefaultCreepReactions[ERR_TIRED] = e_CreepResponse.Continue;
DefaultCreepReactions[ERR_NO_BODYPART] = e_CreepResponse.CancelCommands;
DefaultCreepReactions[ERR_RCL_NOT_ENOUGH] = e_CreepResponse.CancelCommands;
DefaultCreepReactions[ERR_GCL_NOT_ENOUGH] = e_CreepResponse.Throw;

export class BasicCreepCommand {
    /*private static readonly CreepReactions = DefaultCreepReactions;

    static CreepReactionToCommandCompletion(commandResult: ScreepsReturnCode, commandReactions?: { [key: number]: e_CreepResponse }): SwarmReturnCode {
        let reactionType = BasicCreepCommand.CreepReactions[commandResult];
        if (commandReactions && commandReactions[commandResult]) {
            reactionType = commandReactions[commandResult];
        }

        let reactionResult = ERR_INVALID_ARGS as SwarmReturnCode;
        switch (reactionType) {
            case (e_CreepResponse.CancelCommands): {
                // Cancel Commands -- Action is cancelled, can do no more.
                break;
            }
            case (e_CreepResponse.Complete): {
                // Action completed -- Action type is complete and can do no more
                reactionResult = ERR_FULL;
                break;
            }
            case (e_CreepResponse.Continue): {
                // Continue -- Action has not completed and will need to be executed again.
                reactionResult = OK;
                break;
            }
            case (e_CreepResponse.CheckPosition): {
                // Check Position -- Means the action requires a position or something // not sure yet.
                break;
            }
            case (e_CreepResponse.Move): {
                // Move -- Move
                // Put in a repair and a renew
                break;
            }
            case (e_CreepResponse.Retry): {
                // Retry -- Retry
                reactionResult = OK;
                break;
            }
            case (e_CreepResponse.Reset): {
                // Reset -- No Need?
                break;
            }
            case (e_CreepResponse.RequireTarget): {
                // Require Target -- Should this have already been validated?
                break;
            }
            case (e_CreepResponse.Throw):
            // Throw -- thros an error.
            default: {
                throw 'errored';
            }
        }

        return reactionResult;
    }*/

    static ConstructCommandArgs(commandType: CommandType, ...args: any[]): { [name: string]: any } {
        let constructedArgs: { [name: string]: any } = { argsCount: args.length };
        switch (commandType) {
            case (C_Suicide): break;
            case (C_Say):
                constructedArgs['message'] = args[0];
                break;
            case (C_Drop):
                constructedArgs['resourceType'] = args[0];
                if (args[1]) {
                    constructedArgs['amount'] = args[1];
                }
                break;
            case (C_Transfer):
            case (C_Withdraw):
                constructedArgs['resourceType'] = args[1];
                if (args[2]) {
                    constructedArgs['amount'] = args[2];
                }
            default:
                constructedArgs['target'] = args[0];
                break;
        }
        return args;
    }

    static ExecuteCreepCommand(commandType: CommandType, ling: Swarmling, args: { [name: string]: any }): ScreepsReturnCode {
        switch (commandType) {
            case (C_Attack): return ling.attack(args['target']);
            case (C_Build): return ling.build(args['target']);
            case (C_Dismantle): return ling.dismantle(args['target']);
            case (C_Drop): return ling.drop(args['resourceType']);
            case (C_Harvest): return ling.harvest(args['target']);
            case (C_Heal): return ling.heal(args['target']);
            case (C_Pickup): return ling.pickup(args['target']);
            case (C_RangedAttack): return ling.rangedAttack(args['target']);
            case (C_RangedHeal): return ling.rangedHeal(args['target']);
            case (C_Repair): return ling.repair(args['target']);
            case (C_Suicide): return ling.suicide();
            case (C_Say): return ling.say(args['message']);
            case (C_Transfer): return ling.transfer(args['target'], args['resourceType'], args['amount'] ? args['amount'] : undefined);
            case (C_Upgrade): return ling.upgradeController(args['target']);
            case (C_Withdraw): return ling.withdraw(args['target'], args['resourceType'], args['amount'] ? args['amount'] : undefined);
        }
        return ERR_INVALID_ARGS;
    }
}