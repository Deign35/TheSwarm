import { StructureMemory } from "Memory/StorageMemory";
import { NotifiableSwarmObject } from "SwarmTypes/SwarmTypes";

const STRUCTURE_COUNTER = 'CNT';
/*
<T extends SwarmType, U extends Structure>
    extends INotifiableSwarmObject<T, U, IStructureMemory> {*/
export abstract class SwarmStructure<T extends SwarmStructureType, U extends StructureConstant, V extends Structure<U>>
    extends NotifiableSwarmObject<T, SwarmDataType.Structure, V> implements ISwarmStructureType<T, U>, Structure<U> {
    get DataType(): SwarmDataType.Structure { return SwarmDataType.Structure };
    get storageMemoryType() { return SwarmDataType.Structure };

    protected structureMemory!: IStructureMemory;
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
    set memory(mem: IStructureMemory) { this.structureMemory = mem; }
    destroy() { return this._instance.destroy() }
    isActive() { return this._instance.isActive() }
}

export abstract class OwnedSwarmStructure<T extends SwarmStructureType, U extends OwnableStructureConstant, V extends OwnedStructure<U>>
    extends SwarmStructure<T, U, V> {
    get my() { return this._instance.my; }
    get owner() { return this._instance.owner; }
}

export class SwarmExtension extends OwnedSwarmStructure<SwarmType.SwarmExtension, STRUCTURE_EXTENSION, StructureExtension>
    implements ISwarmExtension, StructureExtension {
    get SwarmType(): SwarmType.SwarmExtension { return SwarmType.SwarmExtension; }
    get energy() { return this._instance.energy; }
    get energyCapacity() { return this._instance.energyCapacity; }
    protected OnActivate() {
        console.log("Successfully activated an Extension");
    }
}
export function MakeSwarmExtension(extension: StructureExtension): ISwarmExtension {
    return new SwarmExtension(extension);
}

export class SwarmExtractor extends OwnedSwarmStructure<SwarmType.SwarmExtractor, STRUCTURE_EXTRACTOR, StructureExtractor> implements ISwarmExtractor, StructureExtractor {
    get SwarmType(): SwarmType.SwarmExtractor { return SwarmType.SwarmExtractor; }
    get cooldown() { return this._instance.cooldown; }
    protected OnActivate() {
        console.log("Successfully activated an Extactor");
    }
}
export function MakeSwarmExtractor(extractor: StructureExtractor): ISwarmExtractor {
    return new SwarmExtractor(extractor);
}

export class SwarmObserver extends OwnedSwarmStructure<SwarmType.SwarmObserver, STRUCTURE_OBSERVER, StructureObserver> implements ISwarmObserver, StructureObserver {
    get SwarmType(): SwarmType.SwarmObserver { return SwarmType.SwarmObserver; }
    observeRoom(roomName: string) { return this._instance.observeRoom(roomName); }
    protected OnActivate() {
        console.log("Successfully activated an Observer");
    }
}
export function MakeSwarmObserver(observer: StructureObserver): ISwarmObserver {
    return new SwarmObserver(observer);
}

export class SwarmLink extends OwnedSwarmStructure<SwarmType.SwarmLink, STRUCTURE_LINK, StructureLink> implements ISwarmLink, StructureLink {
    get SwarmType(): SwarmType.SwarmLink { return SwarmType.SwarmLink; }
    get cooldown() { return this._instance.cooldown; }
    get energy() { return this._instance.energy; }
    get energyCapacity() { return this._instance.energyCapacity; }

    transferEnergy(target: SwarmLink, amount: number) {
        return this._instance.transferEnergy(target._instance, amount);
    }
    protected OnActivate() {
        console.log("Successfully activated a Link");
    }
}
export function MakeSwarmLink(link: StructureLink): ISwarmLink {
    return new SwarmLink(link);
}

export class SwarmRampart extends OwnedSwarmStructure<SwarmType.SwarmRampart, STRUCTURE_RAMPART, StructureRampart> implements ISwarmRampart, StructureRampart {
    get SwarmType(): SwarmType.SwarmRampart { return SwarmType.SwarmRampart; }
    get isPublic() { return this._instance.isPublic; }
    get ticksToDecay() { return this._instance.ticksToDecay; }

    setPublic(isPublic: boolean) { return this._instance.setPublic(isPublic); }
    protected OnActivate() {
        console.log("Successfully activated a Ramprt");
    }
}
export function MakeSwarmRampart(rampart: StructureRampart): ISwarmRampart {
    return new SwarmRampart(rampart);
}

export class SwarmStorage extends OwnedSwarmStructure<SwarmType.SwarmStorage, STRUCTURE_STORAGE, StructureStorage> implements ISwarmStorage, StructureStorage {
    get SwarmType(): SwarmType.SwarmStorage { return SwarmType.SwarmStorage; }
    get store() { return this._instance.store; }
    get storeCapacity() { return this._instance.storeCapacity; }
    protected OnActivate() {
        console.log("Successfully activated a Storage");
    }
}
export function MakeSwarmStorage(storage: StructureStorage): ISwarmStorage {
    return new SwarmStorage(storage);
}

export class SwarmTerminal extends OwnedSwarmStructure<SwarmType.SwarmTerminal, STRUCTURE_TERMINAL, StructureTerminal> implements ISwarmTerminal, StructureTerminal {
    get SwarmType(): SwarmType.SwarmTerminal { return SwarmType.SwarmTerminal; }
    get cooldown() { return this._instance.cooldown; }
    get store() { return this._instance.store; }
    get storeCapacity() { return this._instance.storeCapacity; }
    protected OnActivate() {
        console.log("Successfully activated a Terminal");
    }

    send(resourceType: ResourceConstant, amount: number, destination: string, description?: string) {
        return this._instance.send(resourceType, amount, destination, description);
    }
}
export function MakeSwarmTerminal(terminal: StructureTerminal): ISwarmTerminal {
    return new SwarmTerminal(terminal);
}

export class SwarmContainer extends SwarmStructure<SwarmType.SwarmContainer, STRUCTURE_CONTAINER, StructureContainer> implements ISwarmContainer, StructureContainer {
    get SwarmType(): SwarmType.SwarmContainer { return SwarmType.SwarmContainer; }
    get store() { return this._instance.store; }
    get storeCapacity() { return this._instance.storeCapacity; }
    get ticksToDecay() { return this._instance.ticksToDecay; }
    protected OnActivate() {
        console.log("Successfully activated a Container");
    }
}
export function MakeSwarmContainer(container: StructureContainer): ISwarmContainer {
    return new SwarmContainer(container);
}
export class SwarmRoad extends SwarmStructure<SwarmType.SwarmRoad, STRUCTURE_ROAD, StructureRoad> implements ISwarmRoad, StructureRoad {
    get SwarmType(): SwarmType.SwarmRoad { return SwarmType.SwarmRoad; }
    get ticksToDecay() { return this._instance.ticksToDecay };
    protected OnActivate() {
        console.log("Successfully activated a Road");
    }
}
export function MakeSwarmRoad(road: StructureRoad): ISwarmRoad {
    return new SwarmRoad(road);
}

export class SwarmWall extends SwarmStructure<SwarmType.SwarmWall, STRUCTURE_WALL, StructureWall> implements ISwarmWall, StructureWall {
    get SwarmType(): SwarmType.SwarmWall { return SwarmType.SwarmWall; }
    get ticksToLive() { return this._instance.ticksToLive; }
    protected OnActivate() {
        console.log("Successfully activated a Wall");
    }
}
export function MakeSwarmWall(wall: StructureWall): ISwarmWall {
    return new SwarmWall(wall);
}

export class SwarmNuker extends OwnedSwarmStructure<SwarmType.SwarmNuker, STRUCTURE_NUKER, StructureNuker> implements ISwarmNuker, StructureNuker {
    get SwarmType(): SwarmType.SwarmNuker { return SwarmType.SwarmNuker; }
    get energy() { return this._instance.energy; }
    get energyCapacity() { return this._instance.energyCapacity; }
    get ghodium() { return this._instance.ghodium; }
    get ghodiumCapacity() { return this._instance.ghodiumCapacity; }
    get cooldown() { return this._instance.cooldown; }
    protected OnActivate() {
        console.log("Successfully activated a Nuker");
    }

    launchNuke(pos: RoomPosition) { return this._instance.launchNuke(pos); }
}
export function MakeSwarmNuker(nuker: StructureNuker): ISwarmNuker {
    return new SwarmNuker(nuker);
}