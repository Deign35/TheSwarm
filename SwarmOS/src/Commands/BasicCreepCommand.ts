import { SimpleCommand, FrameCommand } from "Commands/CommandBase";

export function CreateBasicCreepCommand(id: string, commandType: BasicCreepCommandType) {
    if (commandType == C_Harvest) { // Instead of this, do an index retrieval on commandType
        return new HarvestCreepCommand(id);
    }

    return undefined;
}

export abstract class CreepCard<T extends CreepCommandType> extends FrameCommand {

}

export abstract class BasicCreepCommand<T extends BasicCreepCommandType> extends SimpleCommand<T> {
    constructor(commandId: string) {
        super(commandId, BasicCreepCommand.Loop);
    }
    protected static ConvertToCreepControlCommand(inVal: BasicCreepCommandType) {
        return c_SimpleCreep[inVal];
    }
    private static Loop<T extends BasicCreepCommandType>(obj: BasicCreepCommand<T>, ...args: any[]) {
        return obj.CreepReactionToCommandCompletion(obj.ExecuteCreepCommand(args));
    }

    protected ExecuteCreepCommand(...args: any[]): ScreepsReturnCode {
        return OK;
    }
    protected abstract CreepReactionToCommandCompletion(commandResult: ScreepsReturnCode): ScreepsReturnCode;/*{
        // Do defaults here.

    }*/
}

export class BuildCreepCommand extends BasicCreepCommand<C_Build> {
    protected ExecuteCreepCommand(...args: any[]): ScreepsReturnCode {
        //terrible code, but for now it'll do...
        return (Game.getObjectById(this.GetData('creepId')) as Creep).build(args[0]);
    }
    protected CreepReactionToCommandCompletion(commandResult: ScreepsReturnCode): ScreepsReturnCode {
        return commandResult;
    }
    protected ConstructCommandArgs(): any[] {
        let target = this.GetData('buildTarget');
        if (!target) {
            // find a target?
        }

        let args: any[] = [];
        args.push(Game.getObjectById(target));
        return args;
    }
}

export class DropCreepCommand extends BasicCreepCommand<C_Drop> {
    protected ExecuteCreepCommand(...args: any[]): ScreepsReturnCode {
        throw new Error("Method not implemented.");
    }
    protected CreepReactionToCommandCompletion(commandResult: ScreepsReturnCode): ScreepsReturnCode {
        throw new Error("Method not implemented.");
    }
    protected ConstructCommandArgs(): any[] {
        throw new Error("Method not implemented.");
    }
}

export class HarvestCreepCommand extends BasicCreepCommand<C_Harvest> {
    protected ExecuteCreepCommand(...args: any[]): ScreepsReturnCode {
        //terrible code, but for now it'll do...
        return (Game.getObjectById(this.GetData('creepId')) as Creep).harvest(args[0]);
    }
    protected CreepReactionToCommandCompletion(commandResult: ScreepsReturnCode): ScreepsReturnCode {
        return commandResult;
    }
    protected ConstructCommandArgs(): any[] {
        let target = this.GetData('harvestTarget');
        if (!target) {
            // find a target?
        }

        let args: any[] = [];
        args.push(Game.getObjectById(target));
        return args;
    }
}

// What is this even?
export class MoveToCreepCommand extends BasicCreepCommand<C_MoveTo> {
    protected ExecuteCreepCommand(...args: any[]): ScreepsReturnCode {
        throw new Error("Method not implemented.");
    }
    protected CreepReactionToCommandCompletion(commandResult: ScreepsReturnCode): ScreepsReturnCode {
        throw new Error("Method not implemented.");
    }
    protected ConstructCommandArgs(): any[] {
        throw new Error("Method not implemented.");
    }
}

export class PickupCreepCommand extends BasicCreepCommand<C_Pickup> {
    protected ExecuteCreepCommand(...args: any[]): ScreepsReturnCode {
        throw new Error("Method not implemented.");
    }
    protected CreepReactionToCommandCompletion(commandResult: ScreepsReturnCode): ScreepsReturnCode {
        throw new Error("Method not implemented.");
    }
    protected ConstructCommandArgs(): any[] {
        throw new Error("Method not implemented.");
    }
}

export class RepairCreepCommand extends BasicCreepCommand<C_Repair> {
    protected ExecuteCreepCommand(...args: any[]): ScreepsReturnCode {
        throw new Error("Method not implemented.");
    }
    protected CreepReactionToCommandCompletion(commandResult: ScreepsReturnCode): ScreepsReturnCode {
        throw new Error("Method not implemented.");
    }
    protected ConstructCommandArgs(): any[] {
        throw new Error("Method not implemented.");
    }
}

export class TransferCreepCommand extends BasicCreepCommand<C_Transfer> {
    protected ExecuteCreepCommand(...args: any[]): ScreepsReturnCode {
        throw new Error("Method not implemented.");
    }
    protected CreepReactionToCommandCompletion(commandResult: ScreepsReturnCode): ScreepsReturnCode {
        throw new Error("Method not implemented.");
    }
    protected ConstructCommandArgs(): any[] {
        throw new Error("Method not implemented.");
    }
}

export class UpgradeCreepCommand extends BasicCreepCommand<C_Upgrade> {
    protected ExecuteCreepCommand(...args: any[]): ScreepsReturnCode {
        throw new Error("Method not implemented.");
    }
    protected CreepReactionToCommandCompletion(commandResult: ScreepsReturnCode): ScreepsReturnCode {
        throw new Error("Method not implemented.");
    }
    protected ConstructCommandArgs(): any[] {
        throw new Error("Method not implemented.");
    }
}

export class WithdrawCreepCommand extends BasicCreepCommand<C_Withdraw> {
    protected ExecuteCreepCommand(...args: any[]): ScreepsReturnCode {
        throw new Error("Method not implemented.");
    }
    protected CreepReactionToCommandCompletion(commandResult: ScreepsReturnCode): ScreepsReturnCode {
        throw new Error("Method not implemented.");
    }
    protected ConstructCommandArgs(): any[] {
        throw new Error("Method not implemented.");
    }
}