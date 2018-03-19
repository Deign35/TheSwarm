import { RoomObjectMemory } from "Memory/StorageMemory";
import { SwarmRoomObject } from "SwarmTypes/SwarmTypes";

export class SwarmSource extends SwarmRoomObject<SwarmType.SwarmSource, Source> implements ISwarmSource, Source {
    get storageMemoryType() { return SwarmDataType.RoomObject };
    GetSpawnRequirements(): ISpawnRequirement {
        // find out how much energy I have available.  Adjust body accordingly
        let body = [WORK, WORK, CARRY, MOVE];
        // find out how soon my current one is going to die
        let neededIn = 1500 - 0;
        // use neededIn to determine 
        return {
            growthTemplate: [],
            minBody: [],
            priority: 0,
            neededIn: 0
        }
    }
    get swarmType(): SwarmType.SwarmSource { return SwarmType.SwarmSource; }
    get energy() { return this._instance.energy; }
    get energyCapacity() { return this._instance.energyCapacity; }
    get room() { return this._instance.room; }
    get ticksToRegeneration() { return this._instance.ticksToRegeneration; }

    //protected data!: ISourceData;
    protected OnActivate() {
        console.log("Successfully activated a Source");
    }
}

export function MakeSwarmSource(source: Source): TSwarmSource {
    return new SwarmSource(source);
}