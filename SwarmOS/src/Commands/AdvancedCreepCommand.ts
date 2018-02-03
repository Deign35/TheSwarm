import { LongCommand } from "Commands/CommandBase";
import { CommandWeb } from "Commands/ComplexCommand";
import { Swarmling } from "SwarmTypes/Swarmling";
import { BasicCreepCommand } from "Commands/BasicCreepCommand";

export class AdvancedCreepCommand extends LongCommand {
    constructor(id: string, public DecisionNetwork: CommandWeb) {
        super(id, AdvancedCreepCommand.ProcessSwarmling);
    }

    ProcessSwarmling(args: {[argId: string]: any }) {
        let ling = args['ling'] as Swarmling;
        let curCommand = ling.Brain.GetData('curCmdID');
        let commandType = this.DecisionNetwork.GetCommandType(curCommand);
        if(!ling.Brain.GetData('CmdArgs')) {
            //BasicCreepCommand.ConstructCommandArgs(commandType, this.ConstructBasicCommandArgs(ling, curCommand, commandType));
        }
        return OK;
    }

    static ProcessSwarmling(cmd: AdvancedCreepCommand, args: {[argId: string]: any }) {
        return cmd.ProcessSwarmling(args);
    }

    protected ConstructBasicCommandArgs(ling: Swarmling, curID: string, commandType: CommandType) : {[id: string]: any} {
        let constructedArgs: { [name: string]: any } = { };
        if(ling.Brain.GetData('CommandPresets')) {
            let CommandPresets = ling.Brain.GetData('CommandPresets');
            if(CommandPresets[curID]) {
                constructedArgs = CommandPresets[curID];
            }
        }
        if(RequiresTarget(commandType) && !constructedArgs['target']) {
            let targettingType = t_Target.FindTarget;

            if(ling.Brain.GetData('CommandTargeting')) {
                let CommandTargeting = ling.Brain.GetData('CommandTargeting');
                if(CommandTargeting[curID]) {
                    targettingType = CommandTargeting[curID];
                }
            }

            switch(targettingType) {
                case(t_Target.AtPosition): {
                    break;
                }

                default:
                    break;
            }
        }
        return constructedArgs;
    }
}

function RequiresTarget(commandType: CommandType) {
    return commandType != C_Drop &&
           commandType != C_Say &&
           commandType != C_Suicide;
}

    /*switch (commandType) {
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
    }    static ConstructCommandArgs(commandType: CommandType, ...args: any[]): { [name: string]: any } {
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
}*/