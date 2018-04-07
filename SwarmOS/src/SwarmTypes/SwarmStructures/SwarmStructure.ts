import { NotifiableSwarmObject, OwnableSwarmObject } from "SwarmTypes/SwarmTypes";
import { StructureMemory, ExtensionMemory, ExtractorMemory, ObserverMemory, LinkMemory, RampartMemory, StorageMemory, TerminalMemory, ContainerMemory, RoadMemory, WallMemory, NukerMemory, KeepersLairMemory, PortalMemory, PowerBankMemory, PowerSpawnMemory, StructureMemoryBase } from "SwarmMemory/StructureMemory";
import { MemoryBase, SwarmMemory } from "SwarmMemory/SwarmMemory";

export abstract class SwarmStructure<T extends SwarmStructureType, U extends StructureConstant,
    W extends StructureMemoryBase<T, U>, X extends Structure<U>>
    extends NotifiableSwarmObject<SwarmDataType.Structure, T, U, W, X> implements Structure<U> {
    get hits() { return this._instance.hits; }
    get hitsMax() { return this._instance.hitsMax; }
    get room() { return this._instance.room; }
    get structureType(): U { return this._instance.structureType; }
    get saveID() { return this.id; }

    destroy() { return this._instance.destroy() }
    isActive() { return this._instance.isActive() }
}

export abstract class OwnedSwarmStructure<T extends SwarmOwnableStructureType, U extends OwnableStructureConstant,
    W extends SwarmMemory<SwarmDataType.Structure, T, U>, X extends OwnedStructure<U>>
    extends SwarmStructure<T, U, W, X> {
    get my() { return this._instance.my; }
    get owner() { return this._instance.owner; }
}

export class SwarmExtension extends OwnedSwarmStructure<SwarmType.SwarmExtension, STRUCTURE_EXTENSION,
    ExtensionMemory, StructureExtension> implements StructureExtension {
    get energy() { return this._instance.energy; }
    get energyCapacity() { return this._instance.energyCapacity; }
    protected OnPrepObject() { }
    protected OnActivate() { }
}

export class SwarmExtractor extends OwnedSwarmStructure<SwarmType.SwarmExtractor, STRUCTURE_EXTRACTOR,
    ExtractorMemory, StructureExtractor> implements StructureExtractor {
    get cooldown() { return this._instance.cooldown; }
    protected OnPrepObject() { }
    protected OnActivate() { }
}

export class SwarmObserver extends OwnedSwarmStructure<SwarmType.SwarmObserver, STRUCTURE_OBSERVER,
    ObserverMemory, StructureObserver> implements StructureObserver {
    observeRoom(roomName: string) { return this._instance.observeRoom(roomName); }
    protected OnPrepObject() { }
    protected OnActivate() { }
}

export class SwarmLink extends OwnedSwarmStructure<SwarmType.SwarmLink, STRUCTURE_LINK,
    LinkMemory, StructureLink> implements StructureLink {
    get cooldown() { return this._instance.cooldown; }
    get energy() { return this._instance.energy; }
    get energyCapacity() { return this._instance.energyCapacity; }

    transferEnergy(target: SwarmLink, amount: number) {
        return this._instance.transferEnergy(target._instance, amount);
    }
    protected OnPrepObject() { }
    protected OnActivate() { }
}

export class SwarmRampart extends OwnedSwarmStructure<SwarmType.SwarmRampart, STRUCTURE_RAMPART,
    RampartMemory, StructureRampart> implements StructureRampart {
    get isPublic() { return this._instance.isPublic; }
    get ticksToDecay() { return this._instance.ticksToDecay; }

    setPublic(isPublic: boolean) { return this._instance.setPublic(isPublic); }
    protected OnPrepObject() { }
    protected OnActivate() { }
}

export class SwarmStorage extends OwnedSwarmStructure<SwarmType.SwarmStorage, STRUCTURE_STORAGE,
    StorageMemory, StructureStorage> implements StructureStorage {
    get store() { return this._instance.store; }
    get storeCapacity() { return this._instance.storeCapacity; }
    protected OnPrepObject() { }
    protected OnActivate() { }
}

export class SwarmTerminal extends OwnedSwarmStructure<SwarmType.SwarmTerminal, STRUCTURE_TERMINAL,
    TerminalMemory, StructureTerminal> implements StructureTerminal {
    get cooldown() { return this._instance.cooldown; }
    get store() { return this._instance.store; }
    get storeCapacity() { return this._instance.storeCapacity; }
    protected OnPrepObject() { }
    protected OnActivate() { }

    send(resourceType: ResourceConstant, amount: number, destination: string, description?: string) {
        return this._instance.send(resourceType, amount, destination, description);
    }
}

export class SwarmContainer extends SwarmStructure<SwarmType.SwarmContainer, STRUCTURE_CONTAINER,
    ContainerMemory, StructureContainer> implements StructureContainer {
    get store() { return this._instance.store; }
    get storeCapacity() { return this._instance.storeCapacity; }
    get ticksToDecay() { return this._instance.ticksToDecay; }
    protected OnPrepObject() { }
    protected OnActivate() { }
}
export class SwarmRoad extends SwarmStructure<SwarmType.SwarmRoad, STRUCTURE_ROAD,
    RoadMemory, StructureRoad> implements StructureRoad {
    get ticksToDecay() { return this._instance.ticksToDecay };
    protected OnPrepObject() { }
    protected OnActivate() { }
}

export class SwarmWall extends SwarmStructure<SwarmType.SwarmWall, STRUCTURE_WALL,
    WallMemory, StructureWall> implements StructureWall {
    get ticksToLive() { return this._instance.ticksToLive; }
    protected OnPrepObject() { }
    protected OnActivate() { }
}

export class SwarmNuker extends OwnedSwarmStructure<SwarmType.SwarmNuker, STRUCTURE_NUKER,
    NukerMemory, StructureNuker> implements StructureNuker {
    get energy() { return this._instance.energy; }
    get energyCapacity() { return this._instance.energyCapacity; }
    get ghodium() { return this._instance.ghodium; }
    get ghodiumCapacity() { return this._instance.ghodiumCapacity; }
    get cooldown() { return this._instance.cooldown; }
    protected OnPrepObject() { }
    protected OnActivate() { }

    launchNuke(pos: RoomPosition) { return this._instance.launchNuke(pos); }
}

export class SwarmKeepersLair extends OwnedSwarmStructure<SwarmType.SwarmKeepersLair, STRUCTURE_KEEPER_LAIR,
    KeepersLairMemory, StructureKeeperLair> implements StructureKeeperLair {
    get ticksToSpawn(): number | undefined { return this._instance.ticksToSpawn; }
    protected OnPrepObject() { }
    protected OnActivate() { }
}
export class SwarmPortal extends SwarmStructure<SwarmType.SwarmPortal, STRUCTURE_PORTAL,
    PortalMemory, StructurePortal> implements StructurePortal {
    get destination(): RoomPosition { return this._instance.destination; }
    get ticksToDecay(): number { return this._instance.ticksToDecay; }
    protected OnPrepObject() { }
    protected OnActivate() { }
}

export class SwarmPowerBank extends SwarmStructure<SwarmType.SwarmPowerBank, STRUCTURE_POWER_BANK,
    PowerBankMemory, StructurePowerBank> implements StructurePowerBank {
    get power() { return this._instance.power; }
    get ticksToDecay() { return this._instance.ticksToDecay; }
    protected OnPrepObject() { }
    protected OnActivate() { }
}

export class SwarmPowerSpawn extends OwnedSwarmStructure<SwarmType.SwarmPowerSpawn, STRUCTURE_POWER_SPAWN,
    PowerSpawnMemory, StructurePowerSpawn> implements StructurePowerSpawn {
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
    protected OnPrepObject() { }
    protected OnActivate() { }
}