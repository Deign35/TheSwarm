import { FlagMemory, SwarmMemory } from "SwarmMemory/SwarmMemory";
import { profile } from "Tools/Profiler";
import { SwarmObject_RoomObject } from "./SwarmTypes";

@profile
export class SwarmFlag<T extends FlagType> extends SwarmObject_RoomObject<SwarmDataType.Flag,
SwarmType.SwarmFlag, T, SwarmMemory<SwarmDataType.Flag, SwarmType.SwarmFlag, T>, Flag> implements Flag {
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
    PrepObject(unused: boolean) {
        return super.PrepObject(true);
    }
    protected OnPrepObject() { }
    protected OnActivate() { }
}