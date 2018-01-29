import { SimpleCommand } from "Commands/CommandBase";

export function CreateBasicCreepCommand(id: string, commandType: BasicCreepCommandTypes) {
    if(commandType == C_Harvest) {
        return new HarvestCreepCommand(id);
    }

    return undefined;
}

export abstract class BasicCreepCommand<T extends BasicCreepCommandTypes> extends SimpleCommand<T> {
    constructor(commandId: string) {
        super(commandId, BasicCreepCommand.Loop);
    }
    protected static ConvertToCreepControlCommand(inVal: BasicCreepCommandTypes) {
        return c_SimpleCreep[inVal];
    }
    private static Loop<T extends BasicCreepCommandTypes>(obj: BasicCreepCommand<T>, ...args: any[]) {
        return obj.CreepReactionToCommandCompletion(obj.ExecuteCreepCommand(args));
    }

    protected abstract ExecuteCreepCommand(...args: any[]): ScreepsReturnCode;
    protected abstract CreepReactionToCommandCompletion(commandResult: ScreepsReturnCode): ScreepsReturnCode;/*{
        // Do defaults here.

    }*/
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
        if(!target) {
            // find a target?
        }

        let args: any[] = [];
        args.push(Game.getObjectById(target));
        return args;
    }
}