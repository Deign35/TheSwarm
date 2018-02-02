import { Swarmling } from "SwarmTypes/Swarmling";
import { ShortCommand } from "Commands/CommandBase";

export class BasicCreepCommand {
    constructor(public Name: string, public Type: CommandType) { }
    CreepCommandData: { [id: string]: string | number };
    AssignedCreep: Creep;
    Execute() {
        return BasicCreepCommand.ExecuteCreepCommand(this.Type, this.AssignedCreep, this.CreepCommandData);
    }
    static SaveCommand(MemoryObj: IMemory, command: BasicCreepCommand) {
        let commandMemory = {} as Dictionary;
        commandMemory['commandType'] = command.Type;
        commandMemory['commandData'] = command.CreepCommandData;
        commandMemory['assignedCreepId'] = command.AssignedCreep.id;
        MemoryObj.SetData(command.Name, commandMemory)
    }
    static LoadCommand(MemoryObj: IMemory, commandName: string) {
        let commandMemory = MemoryObj.GetData(commandName);
        let newCommand = new BasicCreepCommand(commandName, commandMemory['commandType']);
        newCommand.CreepCommandData = commandMemory['commandData'];
        newCommand.AssignedCreep = Game.getObjectById(commandMemory['assignedCreepId']) as Creep;
        // Creep doesn't have memory right now...
    }
    /*static ConstructCommandArgs(commandType: CommandType, command: BasicCreepCommand): { [name: string]: any } {
        let constructedArgs: { [name: string]: any } = {};//; = { argsCount: args.length };//
        switch (commandType) {
            case (C_Suicide): break;
            case (C_Say):
                constructedArgs['message'] = command.CreepCommandData['message'];
                break;
            case (C_Drop):
                constructedArgs['resourceType'] = command.CreepCommandData['resourceType'];
                if (command.CreepCommandData.Amount) {
                    constructedArgs['amount'] = command.CreepCommandData['amount'];
                }
                break;
            case (C_Transfer):
            case (C_Withdraw):
                constructedArgs['resourceType'] = command.CreepCommandData.ResourceType;
                if (command.CreepCommandData.Amount) {
                    constructedArgs['amount'] = command.CreepCommandData.Amount;
                }
            default:
                constructedArgs['target'] = Game.getObjectById(command.CreepCommandData.Target as string);
                break;
        }
        return constructedArgs;
    }*/

    static ExecuteCreepCommand(commandType: CommandType, ling: Creep, args: { [name: string]: any }): ScreepsReturnCode {
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