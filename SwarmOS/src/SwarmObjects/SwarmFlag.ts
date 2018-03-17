import { SwarmItemWithName } from "SwarmObjects/SwarmObject";
import { FlagMemory } from "Memory/StorageMemory";
import { profile } from "Tools/Profiler";

@profile
export class SwarmFlag extends SwarmItemWithName<Flag, SwarmType.SwarmFlag, FlagMemory> implements ISwarmFlag, Flag {
    get swarmType(): SwarmType.SwarmFlag { return SwarmType.SwarmFlag; };
    get pos() { return this._instance.pos; }
    get room() { return this._instance.room; }
    get prototype(): Flag { return this._instance.prototype as Flag; }
    get color() { return this._instance.color; }
    get secondaryColor() { return this._instance.secondaryColor; }
    get memory() { return this._memory; }
    set memory(mem: FlagMemory) { this._memory = mem; }
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
export function MakeSwarmFlag(flag: Flag, memory: FlagMemory): TSwarmFlag {
    return new SwarmFlag(flag, memory);
}