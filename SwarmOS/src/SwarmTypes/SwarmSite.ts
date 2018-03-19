import { SwarmRoomObject } from "./SwarmTypes";

export class SwarmSite extends SwarmRoomObject<SwarmType.SwarmSite, ConstructionSite> implements ISwarmSite, ConstructionSite {
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
        console.log("Successfully activated a Site");
    }
}
export function MakeSwarmSite(site: ConstructionSite): ISwarmSite {
    return new SwarmSite(site);
}