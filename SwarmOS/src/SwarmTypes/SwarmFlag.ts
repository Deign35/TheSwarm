import { profile } from "Tools/Profiler";
import { SwarmTypeBase } from "SwarmTypes/SwarmTypes";

/*
export class SwarmCreep<T extends CreepType> extends OwnableSwarmObject<ICreepData<T>, Creep>
    implements AICreep, Creep {
    Activate(mem: ICreepData<T>, obj: Creep): ICreepData<T> {
        throw new Error("Method not implemented.");
    }
    InitAsNew(obj: Creep): ICreepData<T> {
        throw new Error("Method not implemented.");
    }
    PrepObject(mem: ICreepData<T>, obj: Creep): ICreepData<T> {
        throw new Error("Method not implemented.");
    }*/
@profile
export class SwarmFlag_Base<T extends FlagType> extends SwarmTypeBase<IData, Flag>
    implements AIFlag, Flag {
    GetSwarmSubType(): T {
        return this.memory.SUB_TYPE as T;
    }
    get DataType(): SwarmDataType.Flag { return SwarmDataType.Flag };
    get SwarmType(): SwarmType.SwarmFlag { return SwarmType.SwarmFlag; };
    get pos() { return this._instance.pos; }
    get room() { return this._instance.room; }
    get prototype(): Flag { return this._instance as Flag; }
    get color() { return this._instance.color; }
    get secondaryColor() { return this._instance.secondaryColor; }
    get name() { return this._instance.name; }
    get saveID() { return this.name; }

    remove() { return this._instance.remove(); }
    setColor(color: ColorConstant, secondaryColor?: ColorConstant) {
        return this._instance.setColor(color, secondaryColor);
    }
    setPosition(...args: any[]) {
        if (args.length == 2) {
            return this._instance.setPosition(args[0], args[1]);
        } else {
            return this._instance.setPosition(args[0]);
        }
    }
}

export type SwarmFlag = SwarmFlag_Base<FlagType>;