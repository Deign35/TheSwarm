import { OwnableSwarmObject } from "./SwarmObject";
import { RoomObjectMemory } from "Memory/StorageMemory";

export class SwarmSite extends OwnableSwarmObject<ConstructionSite, SwarmType.SwarmSite, RoomObjectData> implements ISwarmSite, ConstructionSite {
    /** Implement ConstructionSite */
    get swarmType(): SwarmType.SwarmSite { return SwarmType.SwarmSite; }
    get progress() { return this._instance.progress; }
    get progressTotal() { return this._instance.progressTotal; }
    get structureType() { return this._instance.structureType; }
    remove() { return this._instance.remove(); }
}
export function MakeSwarmSite(site: ConstructionSite, memory: RoomObjectMemory): TSwarmSite {
    return new SwarmSite(site, memory);
}