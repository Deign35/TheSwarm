import { RoomObjectMemory } from "SwarmMemory/StorageMemory";
import { SwarmRoomObject } from "SwarmTypes/SwarmTypes";
import { SwarmCreep } from "SwarmTypes/SwarmCreep";

export class SwarmSource extends SwarmRoomObject<ISourceMemory, Source> implements ISwarmSource, Source {
    get storageMemoryType() { return SwarmDataType.RoomObject };
    get SwarmType(): SwarmType.SwarmSource { return SwarmType.SwarmSource; }
    get energy() { return this._instance.energy; }
    get energyCapacity() { return this._instance.energyCapacity; }
    get room() { return this._instance.room; }
    get ticksToRegeneration() { return this._instance.ticksToRegeneration; }

    protected OnActivate() {
        console.log('Successfully activated a source');
    }
}