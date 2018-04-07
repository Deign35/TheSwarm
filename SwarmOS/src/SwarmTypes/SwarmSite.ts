import { SwarmRoomObject } from "./SwarmTypes";
import { ConstructionSiteMemory } from "SwarmMemory/RoomObjectMemory";
import { profile } from "Tools/Profiler";

@profile
export class SwarmSite extends SwarmRoomObject<SwarmType.SwarmSite, ISiteData, ConstructionSiteMemory, ConstructionSite>
    implements ConstructionSite {
    get my() { return this._instance.my; }
    get owner() { return this._instance.owner; }
    get storageMemoryType() { return SwarmDataType.RoomObject };
    /** Implement ConstructionSite */
    get SwarmType(): SwarmType.SwarmSite { return SwarmType.SwarmSite; }
    get progress() { return this._instance.progress; }
    get progressTotal() { return this._instance.progressTotal; }
    get structureType() { return this._instance.structureType; }
    remove() { return this._instance.remove(); }
    protected OnActivate() {
    }
    protected OnPrepObject() {

    }
}