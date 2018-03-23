import { StructureMemory } from "SwarmMemory/StorageMemory";
import { NotifiableSwarmObject, OwnableSwarmObject } from "SwarmTypes/SwarmTypes";

export abstract class SwarmStructure<T extends SwarmStructureType, U extends StructureConstant, V extends Structure<U>>
    extends NotifiableSwarmObject<IStructureMemory, V> implements ISwarmStructureType<T, U>, Structure<U> {
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

export class SwarmExtractor extends OwnedSwarmStructure<SwarmType.SwarmExtractor, STRUCTURE_EXTRACTOR, StructureExtractor> implements ISwarmExtractor, StructureExtractor {
    get SwarmType(): SwarmType.SwarmExtractor { return SwarmType.SwarmExtractor; }
    get cooldown() { return this._instance.cooldown; }
    protected OnActivate() {
        console.log("Successfully activated an Extactor");
    }
}

export class SwarmObserver extends OwnedSwarmStructure<SwarmType.SwarmObserver, STRUCTURE_OBSERVER, StructureObserver> implements ISwarmObserver, StructureObserver {
    get SwarmType(): SwarmType.SwarmObserver { return SwarmType.SwarmObserver; }
    observeRoom(roomName: string) { return this._instance.observeRoom(roomName); }
    protected OnActivate() {
        console.log("Successfully activated an Observer");
    }
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

export class SwarmRampart extends OwnedSwarmStructure<SwarmType.SwarmRampart, STRUCTURE_RAMPART, StructureRampart> implements ISwarmRampart, StructureRampart {
    get SwarmType(): SwarmType.SwarmRampart { return SwarmType.SwarmRampart; }
    get isPublic() { return this._instance.isPublic; }
    get ticksToDecay() { return this._instance.ticksToDecay; }

    setPublic(isPublic: boolean) { return this._instance.setPublic(isPublic); }
    protected OnActivate() {
        console.log("Successfully activated a Rampart");
    }
}

export class SwarmStorage extends OwnedSwarmStructure<SwarmType.SwarmStorage, STRUCTURE_STORAGE, StructureStorage> implements ISwarmStorage, StructureStorage {
    get SwarmType(): SwarmType.SwarmStorage { return SwarmType.SwarmStorage; }
    get store() { return this._instance.store; }
    get storeCapacity() { return this._instance.storeCapacity; }
    protected OnActivate() {
        console.log("Successfully activated a Storage");
    }
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

export class SwarmContainer extends SwarmStructure<SwarmType.SwarmContainer, STRUCTURE_CONTAINER, StructureContainer> implements ISwarmContainer, StructureContainer {
    get SwarmType(): SwarmType.SwarmContainer { return SwarmType.SwarmContainer; }
    get store() { return this._instance.store; }
    get storeCapacity() { return this._instance.storeCapacity; }
    get ticksToDecay() { return this._instance.ticksToDecay; }
    protected OnActivate() {
        console.log("Successfully activated a Container");
    }
}
export class SwarmRoad extends SwarmStructure<SwarmType.SwarmRoad, STRUCTURE_ROAD, StructureRoad> implements ISwarmRoad, StructureRoad {
    get SwarmType(): SwarmType.SwarmRoad { return SwarmType.SwarmRoad; }
    get ticksToDecay() { return this._instance.ticksToDecay };
    protected OnActivate() {
        console.log("Successfully activated a Road");
    }
}

export class SwarmWall extends SwarmStructure<SwarmType.SwarmWall, STRUCTURE_WALL, StructureWall> implements ISwarmWall, StructureWall {
    get SwarmType(): SwarmType.SwarmWall { return SwarmType.SwarmWall; }
    get ticksToLive() { return this._instance.ticksToLive; }
    protected OnActivate() {
        console.log("Successfully activated a Wall");
    }
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

export class SwarmKeepersLair extends OwnedSwarmStructure<SwarmType.SwarmKeepersLair,
    STRUCTURE_KEEPER_LAIR, StructureKeeperLair> implements ISwarmKeepersLair, StructureKeeperLair {
    get ticksToSpawn(): number | undefined { return this._instance.ticksToSpawn; }
    protected OnActivate() {
        console.log("Successfully activated a KeepersLair");
    }
}
export class SwarmPortal extends SwarmStructure<SwarmType.SwarmPortal, STRUCTURE_PORTAL, StructurePortal> implements ISwarmPortal, StructurePortal {
    get destination(): RoomPosition { return this._instance.destination; }
    get ticksToDecay(): number { return this._instance.ticksToDecay; }
    protected OnActivate() {
        console.log("Successfully activated a Portal");
    }
}

export class SwarmPowerBank extends SwarmStructure<SwarmType.SwarmPowerBank, STRUCTURE_POWER_BANK,
    StructurePowerBank> implements ISwarmPowerBank, StructurePowerBank {
    get power() { return this._instance.power; }
    get ticksToDecay() { return this._instance.ticksToDecay; }
    protected OnActivate() {
        console.log("Successfully activated a PowerBank");
    }
}

export class SwarmPowerSpawn extends OwnedSwarmStructure<SwarmType.SwarmPowerSpawn, STRUCTURE_POWER_SPAWN,
    StructurePowerSpawn> implements ISwarmPowerSpawn, StructurePowerSpawn {
    get energy() { return this._instance.energy; }
    get energyCapacity() { return this._instance.energyCapacity; }
    get power() { return this._instance.power; }
    get powerCapacity() { return this._instance.powerCapacity; }
    createPowerCreep(name: string): ScreepsReturnCode {
        return this._instance.createPowerCreep(name);
    }
    processPower(): ScreepsReturnCode {
        return this._instance.processPower();
    }
    protected OnActivate() {
        console.log("Successfully activated a PowerSpawn");
    }
}