import { FlagMemory } from "SwarmMemory/StorageMemory";
import { profile } from "Tools/Profiler";
import { SwarmItemWithName } from "SwarmTypes/SwarmTypes";

const FLAG_COUNTER = 'CNT';
@profile
export class SwarmFlag extends SwarmItemWithName<IFlagMemory, Flag> implements ISwarmFlag, Flag {
    get DataType(): SwarmDataType.Flag { return SwarmDataType.Flag };
    get SwarmType(): SwarmType.SwarmFlag { return SwarmType.SwarmFlag; };
    get pos() { return this._instance.pos; }
    get room() { return this._instance.room; }
    get prototype(): Flag { return this._instance.prototype as Flag; }
    get color() { return this._instance.color; }
    get secondaryColor() { return this._instance.secondaryColor; }
    get memory() { return this._memory; }
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
    protected OnActivate() {
        console.log("Successfully activated a Flag");
    }
}