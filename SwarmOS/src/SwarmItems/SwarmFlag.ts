import { SwarmItemWithName } from "SwarmItems/SwarmItem";
import { FlagMemory } from "Memory/StorageMemory";
import { profile } from "Tools/Profiler";

const FLAG_COUNTER = 'CNT';
@profile
export class SwarmFlag extends SwarmItemWithName<Flag> implements ISwarmFlag, Flag {
    get storageMemoryType() { return StorageMemoryType.Flag };
    Activate() {
        if (this._memory.HasData('CNT')) {
            this.room!.visual.text(this._memory.GetData('CNT'), this.pos);
        }
        let curCount = this._memory.GetData<number>(FLAG_COUNTER) || 5;
        this._memory.SetData(FLAG_COUNTER, curCount + 3)
    }

    get swarmType(): SwarmType.SwarmFlag { return SwarmType.SwarmFlag; };
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
}
export function MakeSwarmFlag(flag: Flag): TSwarmFlag {
    return new SwarmFlag(flag);
}