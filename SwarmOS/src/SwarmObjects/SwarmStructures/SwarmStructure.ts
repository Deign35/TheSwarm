import { SwarmObject, NotifiableSwarmObject } from "../SwarmObject";
import { StructureMemory } from "Memory/StorageMemory";

const STRUCTURE_COUNTER = 'CNT';
export abstract class SwarmStructure<U extends StructureConstant, T extends Structure<U>> extends NotifiableSwarmObject<T> implements ISwarmStructure<T>, Structure {
    get storageMemoryType() { return StorageMemoryType.Structure };
    Activate() {
        let curCount = this._memory.GetData<number>(STRUCTURE_COUNTER) || 98;
        this._memory.SetData(STRUCTURE_COUNTER, curCount + 2);
    }

    protected structureMemory!: StructureMemory;
    StartTick() { }
    ProcessTick() { }
    EndTick() { }

    Modules!: { [moduleType: number]: any };

    get hits() { return this._instance.hits; }
    get hitsMax() { return this._instance.hitsMax; }
    get room() { return this._instance.room; }
    get structureType(): U { return this._instance.structureType; }
    get saveID() { return this.id; }

    get memory() { return this.structureMemory; }
    set memory(mem: StructureMemory) { this.structureMemory = mem; }
    destroy() { return this._instance.destroy() }
    isActive() { return this._instance.isActive() }
}

export abstract class OwnedSwarmStructure<U extends StructureConstant, T extends OwnedStructure<U>>
    extends SwarmStructure<U, T> implements IOwnableSwarmObject<T>, OwnedStructure {
    get my() { return this._instance.my; }
    get owner() { return this._instance.owner; }
}

export class SwarmExtension extends OwnedSwarmStructure<STRUCTURE_EXTENSION, StructureExtension>
    implements ISwarmExtension, StructureExtension {
    get swarmType(): SwarmType.SwarmExtension { return SwarmType.SwarmExtension; }
    get energy() { return this._instance.energy; }
    get energyCapacity() { return this._instance.energyCapacity; }
}
export function MakeSwarmExtension(extension: StructureExtension, parentPath: string[]): TSwarmExtension {
    return new SwarmExtension(extension, parentPath);
}

export class SwarmExtractor extends OwnedSwarmStructure<STRUCTURE_EXTRACTOR, StructureExtractor> implements ISwarmExtractor, StructureExtractor {
    get swarmType(): SwarmType.SwarmExtractor { return SwarmType.SwarmExtractor; }
    get cooldown() { return this._instance.cooldown; }
}
export function MakeSwarmExtractor(extractor: StructureExtractor, parentPath: string[]): TSwarmExtractor {
    return new SwarmExtractor(extractor, parentPath);
}

export class SwarmObserver extends OwnedSwarmStructure<STRUCTURE_OBSERVER, StructureObserver> implements ISwarmObserver, StructureObserver {
    get swarmType(): SwarmType.SwarmObserver { return SwarmType.SwarmObserver; }
    observeRoom(roomName: string) { return this._instance.observeRoom(roomName); }
}
export function MakeSwarmObserver(observer: StructureObserver, parentPath: string[]): TSwarmObserver {
    return new SwarmObserver(observer, parentPath);
}

export class SwarmLink extends OwnedSwarmStructure<STRUCTURE_LINK, StructureLink> implements ISwarmLink, StructureLink {
    get swarmType(): SwarmType.SwarmLink { return SwarmType.SwarmLink; }
    get cooldown() { return this._instance.cooldown; }
    get energy() { return this._instance.energy; }
    get energyCapacity() { return this._instance.energyCapacity; }

    transferEnergy(target: SwarmLink, amount: number) {
        return this._instance.transferEnergy(target._instance, amount);
    }
}
export function MakeSwarmLink(link: StructureLink, parentPath: string[]): TSwarmLink {
    return new SwarmLink(link, parentPath);
}

export class SwarmRampart extends OwnedSwarmStructure<STRUCTURE_RAMPART, StructureRampart> implements ISwarmRampart, StructureRampart {
    get swarmType(): SwarmType.SwarmRampart { return SwarmType.SwarmRampart; }
    get isPublic() { return this._instance.isPublic; }
    get ticksToDecay() { return this._instance.ticksToDecay; }

    setPublic(isPublic: boolean) { return this._instance.setPublic(isPublic); }
}
export function MakeSwarmRampart(rampart: StructureRampart, parentPath: string[]): TSwarmRampart {
    return new SwarmRampart(rampart, parentPath);
}

export class SwarmStorage extends OwnedSwarmStructure<STRUCTURE_STORAGE, StructureStorage> implements ISwarmStorage, StructureStorage {
    get swarmType(): SwarmType.SwarmStorage { return SwarmType.SwarmStorage; }
    get store() { return this._instance.store; }
    get storeCapacity() { return this._instance.storeCapacity; }
}
export function MakeSwarmStorage(storage: StructureStorage, parentPath: string[]): TSwarmStorage {
    return new SwarmStorage(storage, parentPath);
}

export class SwarmTerminal extends OwnedSwarmStructure<STRUCTURE_TERMINAL, StructureTerminal> implements ISwarmTerminal, StructureTerminal {
    get swarmType(): SwarmType.SwarmTerminal { return SwarmType.SwarmTerminal; }
    get cooldown() { return this._instance.cooldown; }
    get store() { return this._instance.store; }
    get storeCapacity() { return this._instance.storeCapacity; }

    send(resourceType: ResourceConstant, amount: number, destination: string, description?: string) {
        return this._instance.send(resourceType, amount, destination, description);
    }
}
export function MakeSwarmTerminal(terminal: StructureTerminal, parentPath: string[]): TSwarmTerminal {
    return new SwarmTerminal(terminal, parentPath);
}

export class SwarmContainer extends SwarmStructure<STRUCTURE_CONTAINER, StructureContainer> implements ISwarmContainer, StructureContainer {
    get swarmType(): SwarmType.SwarmContainer { return SwarmType.SwarmContainer; }
    get store() { return this._instance.store; }
    get storeCapacity() { return this._instance.storeCapacity; }
    get ticksToDecay() { return this._instance.ticksToDecay; }
}
export function MakeSwarmContainer(container: StructureContainer, parentPath: string[]): TSwarmContainer {
    return new SwarmContainer(container, parentPath);
}
export class SwarmRoad extends SwarmStructure<STRUCTURE_ROAD, StructureRoad> implements ISwarmRoad, StructureRoad {
    get swarmType(): SwarmType.SwarmRoad { return SwarmType.SwarmRoad; }
    get ticksToDecay() { return this._instance.ticksToDecay };
}
export function MakeSwarmRoad(road: StructureRoad, parentPath: string[]): TSwarmRoad {
    return new SwarmRoad(road, parentPath);
}

export class SwarmWall extends SwarmStructure<STRUCTURE_WALL, StructureWall> implements ISwarmWall, StructureWall {
    get swarmType(): SwarmType.SwarmWall { return SwarmType.SwarmWall; }
    get ticksToLive() { return this._instance.ticksToLive; }
}
export function MakeSwarmWall(wall: StructureWall, parentPath: string[]): TSwarmWall {
    return new SwarmWall(wall, parentPath);
}

export class SwarmNuker extends OwnedSwarmStructure<STRUCTURE_NUKER, StructureNuker> implements ISwarmNuker, StructureNuker {
    get swarmType(): SwarmType.SwarmNuker { return SwarmType.SwarmNuker; }
    get energy() { return this._instance.energy; }
    get energyCapacity() { return this._instance.energyCapacity; }
    get ghodium() { return this._instance.ghodium; }
    get ghodiumCapacity() { return this._instance.ghodiumCapacity; }
    get cooldown() { return this._instance.cooldown; }

    launchNuke(pos: RoomPosition) { return this._instance.launchNuke(pos); }
}
export function MakeSwarmNuker(nuker: StructureNuker, parentPath: string[]): TSwarmNuker {
    return new SwarmNuker(nuker, parentPath);
}