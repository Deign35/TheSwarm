import { SwarmObject } from "SwarmObjects/SwarmObject";
import { RoomObjectMemory } from "Memory/StorageMemory";

const SOURCE_COUNTER = 'CNT';
export class SwarmSource extends SwarmObject<Source> implements ISwarmSource, Source {
    get storageMemoryType() { return StorageMemoryType.RoomObject };
    Activate() {
        let curCount = this._memory.GetData<number>(SOURCE_COUNTER) || 0;
        this._memory.SetData(SOURCE_COUNTER, curCount - 1);
        super.Activate();
    }
    get swarmType(): SwarmType.SwarmSource { return SwarmType.SwarmSource; }
    get energy() { return this._instance.energy; }
    get energyCapacity() { return this._instance.energyCapacity; }
    get room() { return this._instance.room; }
    get ticksToRegeneration() { return this._instance.ticksToRegeneration; }

    protected data!: SourceData;
}

export function MakeSwarmSource(source: Source): TSwarmSource {
    return new SwarmSource(source);
}