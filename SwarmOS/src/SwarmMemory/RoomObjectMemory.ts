import { SwarmMemoryWithSpecifiedData } from "SwarmMemory/SwarmMemory";

abstract class RoomObjectMemoryBase<T extends SwarmRoomObjectType, U extends IRoomObjectData<T>>
    extends SwarmMemoryWithSpecifiedData<U> implements IRoomObjectData<T> {
    get MEM_TYPE(): SwarmDataType.RoomObject { return SwarmDataType.RoomObject }
    get SUB_TYPE(): T { return this.SWARM_TYPE; }
    get SWARM_TYPE(): T { return this.cache.SWARM_TYPE; }
}
abstract class RoomObjectMemoryWithSpecifiedData<T extends TRoomObjectData>
    extends RoomObjectMemoryBase<SwarmRoomObjectType, T> {
}

export class SourceMemory extends RoomObjectMemoryWithSpecifiedData<ISourceData> implements ISourceData {
    get SUB_TYPE(): SwarmType.SwarmSource { return SwarmType.SwarmSource; }
    get SWARM_TYPE(): SwarmType.SwarmSource { return SwarmType.SwarmSource; }
    get creepID() { return this.cache.creepID; }
    get containerID() { return this.cache.containerID; }
    get linkID() { return this.cache.linkID; }
    get pileID() { return this.cache.pileID; }
    get constructionID() { return this.cache.constructionID; }
}

export class MineralMemory extends RoomObjectMemoryWithSpecifiedData<IMineralData> implements IMineralData {
    get SUB_TYPE(): SwarmType.SwarmMineral { return SwarmType.SwarmMineral; }
    get SWARM_TYPE(): SwarmType.SwarmMineral { return SwarmType.SwarmMineral; }
    get creepID() { return this.cache.creepID; }
    get containerID() { return this.cache.containerID; }
    get pileID() { return this.cache.pileID; }
}

export class NukeMemory extends RoomObjectMemoryWithSpecifiedData<INukeData> implements INukeData {
    get SUB_TYPE(): SwarmType.SwarmNuke { return SwarmType.SwarmNuke; }
    get SWARM_TYPE(): SwarmType.SwarmNuke { return SwarmType.SwarmNuke; }
}


export class ResourceMemory extends RoomObjectMemoryWithSpecifiedData<IResourceData> implements IResourceData {
    get SUB_TYPE(): SwarmType.SwarmResource { return SwarmType.SwarmResource; }
    get SWARM_TYPE(): SwarmType.SwarmResource { return SwarmType.SwarmResource; }
}

export class SiteMemory extends RoomObjectMemoryWithSpecifiedData<ISiteData> implements ISiteData {
    get SUB_TYPE(): SwarmType.SwarmSite { return SwarmType.SwarmSite; }
    get SWARM_TYPE(): SwarmType.SwarmSite { return SwarmType.SwarmSite; }
}

export class TombstoneMemory extends RoomObjectMemoryWithSpecifiedData<ITombstoneData> implements ITombstoneData {
    get SUB_TYPE(): SwarmType.SwarmTombstone { return SwarmType.SwarmTombstone; }
    get SWARM_TYPE(): SwarmType.SwarmTombstone { return SwarmType.SwarmTombstone; }
}

export type RoomObjectMemory = RoomObjectMemoryWithSpecifiedData<TRoomObjectData>;