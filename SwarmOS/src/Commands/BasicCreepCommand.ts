import { Swarmling } from "SwarmTypes/Swarmling";
import { ShortCommand } from "Commands/CommandBase";
import { SwarmMemory } from "Memory/SwarmMemory";

export class CreepCommandData extends SwarmMemory {
    CommandArgs: { [id: string]: string | number };
    AssignedCreep: Swarmling;
    Save() {
        this.SetData('CommandArgs', this.CommandArgs);
        this.AssignedCreep.Brain.Save();
        super.Save();
    }
    Load() {
        super.Load();
        this.CommandArgs = this.GetData('CommandArgs') || {};
        let brain = new SwarmMemory('Ling', this);
        this.AssignedCreep = Game.creeps[brain.GetData('name')] as Swarmling;
        this.AssignedCreep.Brain = brain;
    }
}

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