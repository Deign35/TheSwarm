import { StructureMemory } from "Memory/StorageMemory";
import { NotifiableSwarmObject } from "SwarmTypes/SwarmTypes";

const STRUCTURE_COUNTER = 'CNT';
/*
<T extends SwarmType, U extends Structure>
    extends INotifiableSwarmObject<T, U, IStructureMemory> {*/
export abstract class SwarmStructure<T extends SwarmType, U extends Structure<V>, V extends StructureConstant>
    extends NotifiableSwarmObject<T, U, SwarmDataType.Structure> implements ISwarmStructure<T, U>, Structure {
    get memType(): SwarmDataType.Structure { return SwarmDataType.Structure };

    GetMemoryObject(): IEmptyMemory<SwarmDataType.Structure> {
        throw new Error("Method not implemented.");
    }
    Activate(): void {
        throw new Error("Method not implemented.");
    }
    AssignMemory(mem: IEmptyMemory<SwarmDataType.Structure>): void {
        throw new Error("Method not implemented.");
    }
    InitNewObject(): void {
        throw new Error("Method not implemented.");
    }
    GetSpawnRequirements(): ISpawnRequirement {
        throw new Error("Method not implemented.");
    }
    get storageMemoryType() { return SwarmDataType.Structure };

    protected structureMemory!: IStructureMemory;
    StartTick() { }
    ProcessTick() { }
    EndTick() { }

    Modules!: { [moduleType: number]: any };

    get hits() { return this._instance.hits; }
    get hitsMax() { return this._instance.hitsMax; }
    get room() { return this._instance.room; }
    get structureType(): V { return this._instance.structureType; }
    get saveID() { return this.id; }

    get memory() { return this.structureMemory; }
    set memory(mem: IStructureMemory) { this.structureMemory = mem; }
    destroy() { return this._instance.destroy() }
    isActive() { return this._instance.isActive() }
}

export abstract class OwnedSwarmStructure<T extends SwarmType, U extends OwnedStructure<V>, V extends StructureConstant>
    extends SwarmStructure<T, U, V> implements IOwnableSwarmObject<T, U, SwarmDataType.Structure>, OwnedStructure {
    get my() { return this._instance.my; }
    get owner() { return this._instance.owner; }
}

export class SwarmExtension extends OwnedSwarmStructure<SwarmType.SwarmExtension, StructureExtension, STRUCTURE_EXTENSION>
    implements ISwarmExtension, StructureExtension {
    get swarmType(): SwarmType.SwarmExtension { return SwarmType.SwarmExtension; }
    get energy() { return this._instance.energy; }
    get energyCapacity() { return this._instance.energyCapacity; }
    protected OnActivate() {
        console.log("Successfully activated an Extension");
    }
}
export function MakeSwarmExtension(extension: StructureExtension): TSwarmExtension {
    return new SwarmExtension(extension);
}

export class SwarmExtractor extends OwnedSwarmStructure<SwarmType.SwarmExtractor, StructureExtractor, STRUCTURE_EXTRACTOR> implements ISwarmExtractor, StructureExtractor {
    get swarmType(): SwarmType.SwarmExtractor { return SwarmType.SwarmExtractor; }
    get cooldown() { return this._instance.cooldown; }
    protected OnActivate() {
        console.log("Successfully activated an Extactor");
    }
}
export function MakeSwarmExtractor(extractor: StructureExtractor): TSwarmExtractor {
    return new SwarmExtractor(extractor);
}

export class SwarmObserver extends OwnedSwarmStructure<SwarmType.SwarmObserver, StructureObserver, STRUCTURE_OBSERVER> implements ISwarmObserver, StructureObserver {
    get swarmType(): SwarmType.SwarmObserver { return SwarmType.SwarmObserver; }
    observeRoom(roomName: string) { return this._instance.observeRoom(roomName); }
    protected OnActivate() {
        console.log("Successfully activated an Observer");
    }
}
export function MakeSwarmObserver(observer: StructureObserver): TSwarmObserver {
    return new SwarmObserver(observer);
}

export class SwarmLink extends OwnedSwarmStructure<SwarmType.SwarmLink, StructureLink, STRUCTURE_LINK> implements ISwarmLink, StructureLink {
    get swarmType(): SwarmType.SwarmLink { return SwarmType.SwarmLink; }
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
export function MakeSwarmLink(link: StructureLink): TSwarmLink {
    return new SwarmLink(link);
}

export class SwarmRampart extends OwnedSwarmStructure<SwarmType.SwarmRampart, StructureRampart, STRUCTURE_RAMPART> implements ISwarmRampart, StructureRampart {
    get swarmType(): SwarmType.SwarmRampart { return SwarmType.SwarmRampart; }
    get isPublic() { return this._instance.isPublic; }
    get ticksToDecay() { return this._instance.ticksToDecay; }

    setPublic(isPublic: boolean) { return this._instance.setPublic(isPublic); }
    protected OnActivate() {
        console.log("Successfully activated a Ramprt");
    }
}
export function MakeSwarmRampart(rampart: StructureRampart): TSwarmRampart {
    return new SwarmRampart(rampart);
}

export class SwarmStorage extends OwnedSwarmStructure<SwarmType.SwarmStorage, StructureStorage, STRUCTURE_STORAGE> implements ISwarmStorage, StructureStorage {
    get swarmType(): SwarmType.SwarmStorage { return SwarmType.SwarmStorage; }
    get store() { return this._instance.store; }
    get storeCapacity() { return this._instance.storeCapacity; }
    protected OnActivate() {
        console.log("Successfully activated a Storage");
    }
}
export function MakeSwarmStorage(storage: StructureStorage): TSwarmStorage {
    return new SwarmStorage(storage);
}

export class SwarmTerminal extends OwnedSwarmStructure<SwarmType.SwarmTerminal, StructureTerminal, STRUCTURE_TERMINAL> implements ISwarmTerminal, StructureTerminal {
    get swarmType(): SwarmType.SwarmTerminal { return SwarmType.SwarmTerminal; }
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
export function MakeSwarmTerminal(terminal: StructureTerminal): TSwarmTerminal {
    return new SwarmTerminal(terminal);
}

export class SwarmContainer extends SwarmStructure<SwarmType.SwarmContainer, StructureContainer, STRUCTURE_CONTAINER> implements ISwarmContainer, StructureContainer {
    get swarmType(): SwarmType.SwarmContainer { return SwarmType.SwarmContainer; }
    get store() { return this._instance.store; }
    get storeCapacity() { return this._instance.storeCapacity; }
    get ticksToDecay() { return this._instance.ticksToDecay; }
    protected OnActivate() {
        console.log("Successfully activated a Container");
    }
}
export function MakeSwarmContainer(container: StructureContainer): TSwarmContainer {
    return new SwarmContainer(container);
}
export class SwarmRoad extends SwarmStructure<SwarmType.SwarmRoad, StructureRoad, STRUCTURE_ROAD> implements ISwarmRoad, StructureRoad {
    get swarmType(): SwarmType.SwarmRoad { return SwarmType.SwarmRoad; }
    get ticksToDecay() { return this._instance.ticksToDecay };
    protected OnActivate() {
        console.log("Successfully activated a Road");
    }
}
export function MakeSwarmRoad(road: StructureRoad): TSwarmRoad {
    return new SwarmRoad(road);
}

export class SwarmWall extends SwarmStructure<SwarmType.SwarmWall, StructureWall, STRUCTURE_WALL> implements ISwarmWall, StructureWall {
    get swarmType(): SwarmType.SwarmWall { return SwarmType.SwarmWall; }
    get ticksToLive() { return this._instance.ticksToLive; }
    protected OnActivate() {
        console.log("Successfully activated a Wall");
    }
}
export function MakeSwarmWall(wall: StructureWall): TSwarmWall {
    return new SwarmWall(wall);
}

export class SwarmNuker extends OwnedSwarmStructure<SwarmType.SwarmNuker, StructureNuker, STRUCTURE_NUKER> implements ISwarmNuker, StructureNuker {
    get swarmType(): SwarmType.SwarmNuker { return SwarmType.SwarmNuker; }
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
export function MakeSwarmNuker(nuker: StructureNuker): TSwarmNuker {
    return new SwarmNuker(nuker);
}