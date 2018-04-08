import { SwarmMemoryBase } from "SwarmMemory/SwarmMemory";
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
export class SwarmFlag<T extends FlagType> extends SwarmTypeBase<IFlagData<T>, Flag>
    implements AIFlag, Flag {
    Activate(mem: IFlagData<T>, obj: Flag): IFlagData<T> {
        throw new Error("Method not implemented.");
    }
    InitAsNew(mem: IFlagData<T>, obj: Flag): IFlagData<T> {
        throw new Error("Method not implemented.");
    }
    PrepObject(mem: IFlagData<T>, obj: Flag): IFlagData<T> {
        throw new Error("Method not implemented.");
    }
    get DataType(): SwarmDataType.Flag { return SwarmDataType.Flag };
    get SwarmType(): SwarmType.SwarmFlag { return SwarmType.SwarmFlag; };
    get pos() { return this._instance.pos; }
    get room() { return this._instance.room; }
    get prototype(): Flag { return this._instance.prototype as Flag; }
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