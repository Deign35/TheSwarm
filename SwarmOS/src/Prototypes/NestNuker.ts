import { OwnedSwarmStructure } from "Prototypes/SwarmStructure";

export class NestNuker extends OwnedSwarmStructure<StructureNuker> {
    get energy() { return this._instance.energy; }
    get energyCapacity() { return this._instance.energyCapacity; }
    get ghodium() { return this._instance.ghodium; }
    get ghodiumCapacity() { return this._instance.ghodiumCapacity; }
    get cooldown() { return this._instance.cooldown; }

    launchNuke(pos: RoomPosition) { return this._instance.launchNuke(pos); }
}