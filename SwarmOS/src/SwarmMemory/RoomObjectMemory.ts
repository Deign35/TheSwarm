import { SwarmMemory } from "SwarmMemory/SwarmMemory";
import { profile } from "Tools/Profiler";

@profile
export abstract class RoomObjectMemoryBase<T extends TRoomObjectData, U extends SwarmRoomObjectType>
    extends SwarmMemory<T, U> implements IRoomObjectData<U> {
    get MEM_TYPE(): SwarmDataType.RoomObject { return SwarmDataType.RoomObject }
}

@profile
export class SourceMemory extends RoomObjectMemoryBase<ISourceData, SwarmType.SwarmSource> implements ISourceData {
    get creepID() { return this._cache.creepID; }
    get containerID() { return this._cache.containerID; }
    get linkID() { return this._cache.linkID; }
    get pileID() { return this._cache.pileID; }
}

@profile
export class MineralMemory extends RoomObjectMemoryBase<IMineralData, SwarmType.SwarmMineral> implements IMineralData {
    get creepID() { return this._cache.creepID; }
    get containerID() { return this._cache.containerID; }
    get pileID() { return this._cache.pileID; }
}

@profile
export class NukeMemory extends RoomObjectMemoryBase<TNukeData, SwarmType.SwarmNuke> implements TNukeData { }
@profile
export class TombstoneMemory extends RoomObjectMemoryBase<TTombstoneData, SwarmType.SwarmTombstone> implements TTombstoneData { }
@profile
export class ConstructionSiteMemory extends RoomObjectMemoryBase<TConstructionSiteData, SwarmType.SwarmSite> implements TConstructionSiteData { }
@profile
export class ResourceMemory extends RoomObjectMemoryBase<TResourceData, SwarmType.SwarmResource> implements TResourceData { }

export type RoomObjectMemory = SourceMemory | MineralMemory | NukeMemory | TombstoneMemory | ConstructionSiteMemory | ResourceMemory;