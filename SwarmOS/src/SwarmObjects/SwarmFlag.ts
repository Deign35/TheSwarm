import { SwarmItem } from "SwarmObjects/SwarmObject";

export class SwarmFlag extends SwarmItem<Flag, SwarmType.SwarmFlag> implements ISwarmFlag, Flag {
    get swarmType(): SwarmType.SwarmFlag { return SwarmType.SwarmFlag; };
    get pos() { return this._instance.pos; }
    get room() { return this._instance.room; }
    get prototype(): Flag { return this._instance.prototype as Flag; }
    get color() { return this._instance.color; }
    get secondaryColor() { return this._instance.secondaryColor; }
    get memory() { return this._instance.memory; }
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
    StartTick() { }
    ProcessTick() { }
    EndTick() { }
}
export function MakeSwarmFlag(flag: Flag): TSwarmFlag {
    return new SwarmFlag(flag);
}