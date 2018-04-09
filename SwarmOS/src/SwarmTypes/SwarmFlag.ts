import { SwarmTypeBase } from "SwarmTypes/SwarmTypes";

export class SwarmFlag_Base<T extends FlagType> extends SwarmTypeBase<IData, Flag> implements AIFlag, Flag {
    get pos() { return this._instance.pos; }
    get room() { return this._instance.room; }
    get prototype(): Flag { return this._instance as Flag; }
    get color() { return this._instance.color; }
    get secondaryColor() { return this._instance.secondaryColor; }
    get name() { return this._instance.name; }
    get id() { return this._instance.name; }

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