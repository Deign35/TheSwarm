let DefaultCreepReactions: { [key: number]: e_CResponse } = {};
DefaultCreepReactions[OK] = e_CResponse.Cn;
DefaultCreepReactions[ERR_NOT_OWNER] = e_CResponse.Tr;
DefaultCreepReactions[ERR_NAME_EXISTS] = e_CResponse.Tr;
DefaultCreepReactions[ERR_BUSY] = e_CResponse.Cn;
DefaultCreepReactions[ERR_NOT_FOUND] = e_CResponse.RT;
DefaultCreepReactions[ERR_NOT_ENOUGH_RESOURCES] = e_CResponse.Cm;
DefaultCreepReactions[ERR_INVALID_TARGET] = e_CResponse.RT;
DefaultCreepReactions[ERR_FULL] = e_CResponse.Cm;
DefaultCreepReactions[ERR_NOT_IN_RANGE] = e_CResponse.Mv;
DefaultCreepReactions[ERR_INVALID_ARGS] = e_CResponse.Tr;
DefaultCreepReactions[ERR_TIRED] = e_CResponse.Cn;
DefaultCreepReactions[ERR_NO_BODYPART] = e_CResponse.CC;
DefaultCreepReactions[ERR_RCL_NOT_ENOUGH] = e_CResponse.CC;
DefaultCreepReactions[ERR_GCL_NOT_ENOUGH] = e_CResponse.Tr;

export class BasicCreepCommand implements CreepCommand {
    CreepReactions = DefaultCreepReactions;
    constructor(public CommandType: CommandType, public CommandLoop: CommandFunc = BasicCreepCommand.Loop) { }
    Execute(creep: Creep, ...inArgs: any[]) {
        let result = ERR_INVALID_ARGS as ScreepsReturnCode;
        try {
            result = this.CommandLoop(this, creep, inArgs);
        } catch (e) {
            console.log('Command Failed: ' + e);
        }

        return result;
    }
    public CreepReactionToCommandCompletion(commandResult: ScreepsReturnCode): ScreepsReturnCode {
        let reactionType = this.CreepReactions[commandResult];

        let reactionResult = ERR_INVALID_ARGS;
        switch (reactionType) {
            case (e_CResponse.CC): {
                // Cancel Commands -- Action is cancelled, can do no more.
                break;
            }
            case (e_CResponse.Cm): {
                // Action completed -- Action type is complete and can do no more
                break;
            }
            case (e_CResponse.Cn): {
                // Continue -- Action has not completed and will need to be executed again.
                break;
            }
            case (e_CResponse.CP): {
                // Check Position -- Means the action requires a position or something // not sure yet.
                break;
            }
            case (e_CResponse.Mv): {
                // Move -- Move
                break;
            }
            case (e_CResponse.Re): {
                // Retry -- Retry
                break;
            }
            case (e_CResponse.RS): {
                // Reset -- No Need?
                break;
            }
            case (e_CResponse.RT): {
                // Require Target -- Should this have already been validated?
                break;
            }
            case (e_CResponse.Tr):
            // Throw -- thros an error.
            default: {
                throw 'errored';
            }
        }

        return reactionResult;
    }

    public ConstructCommandArgs(...args: any[]): { [name: string]: any } {
        let constructedArgs: { [name: string]: any } = { argsCount: args.length };
        switch (this.CommandType) {
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

    private static Loop<T extends BasicCreepCommandType>(obj: BasicCreepCommand, creep: Creep, args: { [name: string]: any }) {
        let constructedArgs = obj.ConstructCommandArgs(args);
        let executeResult = BasicCreepCommand.ExecuteCreepCommand(obj.CommandType, creep, constructedArgs);
        return obj.CreepReactionToCommandCompletion(executeResult);
    }

    private static ExecuteCreepCommand(commandType: CommandType, creep: Creep, args: { [name: string]: any }): ScreepsReturnCode {
        switch (commandType) {
            case (C_Attack): return creep.attack(args['target']);
            case (C_Build): return creep.build(args['target']);
            case (C_Dismantle): return creep.dismantle(args['target']);
            case (C_Drop): return creep.drop(args['resourceType']);
            case (C_Harvest): return creep.harvest(args['target']);
            case (C_Heal): return creep.heal(args['target']);

            case (C_Pickup): return creep.pickup(args['target']);
            case (C_RangedAttack): return creep.rangedAttack(args['target']);
            case (C_RangedHeal): return creep.rangedHeal(args['target']);
            case (C_Repair): return creep.repair(args['target']);
            case (C_Suicide): return creep.suicide();
            case (C_Say): return creep.say(args['target']);
            case (C_Transfer): return creep.transfer(args['target'], args['resourceType'], args['amount'] ? args['amount'] : undefined);
            case (C_Upgrade): return creep.upgradeController(args['target']);
            case (C_Withdraw): return creep.withdraw(args['target'], args['resourceType'], args['amount'] ? args['amount'] : undefined);
        }
        return OK;
    }
}