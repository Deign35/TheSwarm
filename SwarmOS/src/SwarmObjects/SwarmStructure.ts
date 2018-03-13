import { SwarmObject, NotifiableSwarmObject } from "./SwarmObject";

export class SwarmStructure<U extends StructureConstant, T extends Structure<U>> extends NotifiableSwarmObject<T> implements ISwarmStructure<T>, Structure {

    get hits() { return this._instance.hits; }
    get hitsMax() { return this._instance.hitsMax; }
    get room() { return this._instance.room; }
    get structureType(): U { return this._instance.structureType; }

    destroy() { return this._instance.destroy() }
    isActive() { return this._instance.isActive() }
}

export class OwnedSwarmStructure<U extends StructureConstant, T extends OwnedStructure<U>> extends SwarmStructure<U, T> implements IOwnableSwarmObject<T>, OwnedStructure {
    get my() { return this._instance.my; }
    get owner() { return this._instance.owner; }
}

export class SwarmExtension extends OwnedSwarmStructure<STRUCTURE_EXTENSION, StructureExtension> implements ISwarmExtension, StructureExtension {
    get energy() { return this._instance.energy; }
    get energyCapacity() { return this._instance.energyCapacity; }
}
export function MakeSwarmExtension(extension: StructureExtension): TSwarmExtension { return new SwarmExtension(extension); }

export class SwarmExtractor extends OwnedSwarmStructure<STRUCTURE_EXTRACTOR, StructureExtractor> implements ISwarmExtractor, StructureExtractor {
    get cooldown() { return this._instance.cooldown; }
}
export function MakeSwarmExtractor(extractor: StructureExtractor): TSwarmExtractor { return new SwarmExtractor(extractor); }

export class SwarmObserver extends OwnedSwarmStructure<STRUCTURE_OBSERVER, StructureObserver> implements ISwarmObserver, StructureObserver {
    observeRoom(roomName: string) { return this._instance.observeRoom(roomName); }
}
export function MakeSwarmObserver(observer: StructureObserver): TSwarmObserver { return new SwarmObserver(observer); }

export class SwarmLink extends OwnedSwarmStructure<STRUCTURE_LINK, StructureLink> implements ISwarmLink, StructureLink {
    get cooldown() { return this._instance.cooldown; }
    get energy() { return this._instance.energy; }
    get energyCapacity() { return this._instance.energyCapacity; }

    transferEnergy(target: SwarmLink, amount: number) {
        return this._instance.transferEnergy(target._instance, amount);
    }
}
export function MakeSwarmLink(link: StructureLink): TSwarmLink { return new SwarmLink(link); }

export class SwarmRampart extends OwnedSwarmStructure<STRUCTURE_RAMPART, StructureRampart> implements ISwarmRampart, StructureRampart {
    get isPublic() { return this._instance.isPublic; }
    get ticksToDecay() { return this._instance.ticksToDecay; }

    setPublic(isPublic: boolean) { return this._instance.setPublic(isPublic); }
}
export function MakeSwarmRampart(rampart: StructureRampart): TSwarmRampart { return new SwarmRampart(rampart); }

export class SwarmStorage extends OwnedSwarmStructure<STRUCTURE_STORAGE, StructureStorage> implements ISwarmStorage, StructureStorage {
    get store() { return this._instance.store; }
    get storeCapacity() { return this._instance.storeCapacity; }
}
export function MakeSwarmStorage(storage: StructureStorage): TSwarmStorage { return new SwarmStorage(storage); }

export class SwarmTerminal extends OwnedSwarmStructure<STRUCTURE_TERMINAL, StructureTerminal> implements ISwarmTerminal, StructureTerminal {
    get cooldown() { return this._instance.cooldown; }
    get store() { return this._instance.store; }
    get storeCapacity() { return this._instance.storeCapacity; }

    send(resourceType: ResourceConstant, amount: number, destination: string, description?: string) {
        return this._instance.send(resourceType, amount, destination, description);
    }
}
export function MakeSwarmTerminal(terminal: StructureTerminal): TSwarmTerminal { return new SwarmTerminal(terminal); }

export class SwarmRoad extends SwarmStructure<STRUCTURE_ROAD, StructureRoad> implements ISwarmRoad, StructureRoad {
    get ticksToDecay() { return this._instance.ticksToDecay };
}
export function MakeSwarmRoad(road: StructureRoad): TSwarmRoad { return new SwarmRoad(road); }

export class SwarmWall extends SwarmStructure<STRUCTURE_WALL, StructureWall> implements ISwarmWall, StructureWall {
    get ticksToLive() { return this._instance.ticksToLive; }
}
export function MakeSwarmWall(wall: StructureWall): TSwarmWall { return new SwarmWall(wall); }

export class SwarmNuker extends OwnedSwarmStructure<STRUCTURE_NUKER, StructureNuker> implements ISwarmNuker, StructureNuker {
    get energy() { return this._instance.energy; }
    get energyCapacity() { return this._instance.energyCapacity; }
    get ghodium() { return this._instance.ghodium; }
    get ghodiumCapacity() { return this._instance.ghodiumCapacity; }
    get cooldown() { return this._instance.cooldown; }

    launchNuke(pos: RoomPosition) { return this._instance.launchNuke(pos); }
}
export function MakeSwarmNuker(nuker: StructureNuker): TSwarmNuker { return new SwarmNuker(nuker); }