import { OwnableSwarmObject } from "./SwarmObject";

export class SwarmSite extends OwnableSwarmObject<ConstructionSite> implements ISwarmSite, ConstructionSite {
    get progress() { return this._instance.progress; }
    get progressTotal() { return this._instance.progressTotal; }
    get structureType() { return this._instance.structureType; }
    remove() { return this._instance.remove(); }
}
export function MakeSwarmSite(site: ConstructionSite): TSwarmSite { return new SwarmSite(site); }