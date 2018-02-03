import { SwarmMemory } from "Memory/SwarmMemory";

export class BasicCreepCommand extends SwarmMemory {
    CommandArgs: { [id: string]: string | number };
    Save() {
        this.SetData('CommandArgs', this.CommandArgs);
        super.Save();
    }
    Load() {
        super.Load();
        this.CommandArgs = this.GetData('CommandArgs') || {};
    }

    Execute() {
        let creep = Game.creeps[this.GetData('AssignedCreep')]; // Get this creep from somewhere else IMO;
        return BasicCreepCommand.ExecuteCreepCommand(this.GetData('CommandType'), creep, this.CommandArgs);
    }

    AssignCreep(creep: Creep) {
        this.SetData('AssignedCreep', creep.name);
    }

    static ExecuteCreepCommand(commandType: CommandType, ling: Creep, args: { [name: string]: any }): SwarmReturnCode {
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