import { SwarmMemory } from "SwarmMemory/SwarmMemory";
import { profile } from "Tools/Profiler";

@profile
export abstract class RoomObjectMemoryBase<T extends SwarmRoomObjectType,
    U extends ISwarmData<SwarmDataType.RoomObject, T, T>>
    extends SwarmMemory<SwarmDataType.RoomObject, T, T, U> implements IRoomObjectData<T> {
    get MEM_TYPE(): SwarmDataType.RoomObject { return SwarmDataType.RoomObject }
    get SUB_TYPE(): T { return this.SWARM_TYPE; }
}

@profile
export class SourceMemory extends RoomObjectMemoryBase<SwarmType.SwarmSource, ISourceData> implements ISourceData {
    get SWARM_TYPE(): SwarmType.SwarmSource { return SwarmType.SwarmSource; }
    get creepID() { return this.cache.creepID; }
    get containerID() { return this.cache.containerID; }
    get linkID() { return this.cache.linkID; }
    get pileID() { return this.cache.pileID; }
    get constructionID() { return this.cache.constructionID; }
}

@profile
export class MineralMemory extends RoomObjectMemoryBase<SwarmType.SwarmMineral, IMineralData> implements IMineralData {
    get SWARM_TYPE(): SwarmType.SwarmMineral { return SwarmType.SwarmMineral; }
    get creepID() { return this.cache.creepID; }
    get containerID() { return this.cache.containerID; }
    get pileID() { return this.cache.pileID; }
}

@profile
export class NukeMemory extends RoomObjectMemoryBase<SwarmType.SwarmNuke, INukeData> implements INukeData {
    get SWARM_TYPE(): SwarmType.SwarmNuke { return SwarmType.SwarmNuke; }
}
@profile
export class TombstoneMemory extends RoomObjectMemoryBase<SwarmType.SwarmTombstone, ITombstoneData> implements ITombstoneData {
    get SWARM_TYPE(): SwarmType.SwarmTombstone { return SwarmType.SwarmTombstone; }
}
@profile
export class ConstructionSiteMemory extends RoomObjectMemoryBase<SwarmType.SwarmSite, ISiteData> implements ISiteData {
    get SWARM_TYPE(): SwarmType.SwarmSite { return SwarmType.SwarmSite; }
}
@profile
export class ResourceMemory extends RoomObjectMemoryBase<SwarmType.SwarmResource, IResourceData> implements IResourceData {
    get SWARM_TYPE(): SwarmType.SwarmResource { return SwarmType.SwarmResource; }
}

export type RoomObjectMemory = SourceMemory | MineralMemory | NukeMemory | TombstoneMemory |
    ConstructionSiteMemory | ResourceMemory;