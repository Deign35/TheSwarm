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