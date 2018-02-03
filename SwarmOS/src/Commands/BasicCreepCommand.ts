import { SwarmMemory } from "Memory/SwarmMemory";
import { BasicCreepCommandType, AdvancedCreepCommandType, CreepCommandType, SwarmReturnCode } from "SwarmEnums";

export class BasicCreepCommand extends SwarmMemory {
    /*Execute() {
        let creep = Game.creeps[this.GetData('AssignedCreep')]; // Get this creep from somewhere else IMO;
        return BasicCreepCommand.ExecuteCreepCommand(this.GetData('CommandType'), creep, this.GetCommandArgs());
    }*/

    GetCommandArgs() {
        return this.GetData('CommandArgs');
    }
    SetCommandArgs(cmdArgs: Dictionary) {
        this.SetData('CommandArgs', cmdArgs);
    }
    AssignCreep(creep: Creep) {
        this.SetData('AssignedCreep', creep.name);
    }

    static ExecuteCreepCommand(commandType: CreepCommandType, ling: Creep, args: { [name: string]: any }): SwarmReturnCode {
        switch (commandType) {
            case (BasicCreepCommandType.C_Attack): return ling.attack(args['target']);
            case (BasicCreepCommandType.C_Build): return ling.build(args['target']);
            case (BasicCreepCommandType.C_Dismantle): return ling.dismantle(args['target']);
            case (BasicCreepCommandType.C_Drop): return ling.drop(args['resourceType']);
            case (BasicCreepCommandType.C_Harvest): return ling.harvest(args['target']);
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
}