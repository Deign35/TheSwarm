import { SwarmMemory } from "SwarmMemory/SwarmMemory";
import { profile } from "Tools/Profiler";

@profile
export abstract class RoomObjectMemoryBase<T extends SwarmRoomObjectType>
    extends SwarmMemory<SwarmDataType.RoomObject, T, T> implements IRoomObjectData<T> {
    get MEM_TYPE(): SwarmDataType.RoomObject { return SwarmDataType.RoomObject }
    get SUB_TYPE(): T { return this.SWARM_TYPE; }
}

@profile
export class SourceMemory extends RoomObjectMemoryBase<SwarmType.SwarmSource> implements ISourceData {
    get cache(): ISourceData {
        return super.cache as ISourceData;
    }
    get SWARM_TYPE(): SwarmType.SwarmSource { return SwarmType.SwarmSource; }
    get creepID() { return this.cache.creepID; }
    get containerID() { return this.cache.containerID; }
    get linkID() { return this.cache.linkID; }
    get pileID() { return this.cache.pileID; }
    get constructionID() { return this.cache.constructionID; }
}

@profile
export class MineralMemory extends RoomObjectMemoryBase<SwarmType.SwarmMineral> implements IMineralData {
    get cache(): IMineralData {
        return super.cache as IMineralData;
    }
    get SWARM_TYPE(): SwarmType.SwarmMineral { return SwarmType.SwarmMineral; }
    get creepID() { return this.cache.creepID; }
    get containerID() { return this.cache.containerID; }
    get pileID() { return this.cache.pileID; }
}

@profile
export class NukeMemory extends RoomObjectMemoryBase<SwarmType.SwarmNuke> implements INukeData {
    get cache(): INukeData {
        return super.cache;
    }
    get SWARM_TYPE(): SwarmType.SwarmNuke { return SwarmType.SwarmNuke; }
}
@profile
export class TombstoneMemory extends RoomObjectMemoryBase<SwarmType.SwarmTombstone> implements ITombstoneData {
    get cache(): ITombstoneData {
        return super.cache;
    }
    get SWARM_TYPE(): SwarmType.SwarmTombstone { return SwarmType.SwarmTombstone; }
}
@profile
export class ConstructionSiteMemory extends RoomObjectMemoryBase<SwarmType.SwarmSite> implements ISiteData {
    get cache(): ISiteData {
        return super.cache;
    }
    get SWARM_TYPE(): SwarmType.SwarmSite { return SwarmType.SwarmSite; }
}
@profile
export class ResourceMemory extends RoomObjectMemoryBase<SwarmType.SwarmResource> implements IResourceData {
    get cache(): IResourceData {
        return super.cache;
    }
    get SWARM_TYPE(): SwarmType.SwarmResource { return SwarmType.SwarmResource; }
}

export type RoomObjectMemory = SourceMemory | MineralMemory | NukeMemory | TombstoneMemory |
    ConstructionSiteMemory | ResourceMemory;