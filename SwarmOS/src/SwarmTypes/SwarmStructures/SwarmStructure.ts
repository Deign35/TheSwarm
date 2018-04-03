import { NotifiableSwarmObject, OwnableSwarmObject } from "SwarmTypes/SwarmTypes";
import { StructureMemory, ExtensionMemory, ExtractorMemory, ObserverMemory, LinkMemory, RampartMemory, StorageMemory, TerminalMemory, ContainerMemory, RoadMemory, WallMemory, NukerMemory, KeepersLairMemory, PortalMemory, PowerBankMemory, PowerSpawnMemory } from "SwarmMemory/StructureMemory";

//<T extends StructureConstant > extends ISwarmObject < TStructureMemory, Structure < T >>
export abstract class SwarmStructure<T extends StructureConstant, U extends Structure<T>, V extends StructureMemory>
    extends NotifiableSwarmObject<U, V> implements Structure<T> {
    get hits() { return this._instance.hits; }
    get hitsMax() { return this._instance.hitsMax; }
    get room() { return this._instance.room; }
    get structureType(): T { return this._instance.structureType; }
    get saveID() { return this.id; }

    destroy() { return this._instance.destroy() }
    isActive() { return this._instance.isActive() }
}

export abstract class OwnedSwarmStructure<T extends OwnableStructureConstant, U extends OwnedStructure<T>, V extends StructureMemory>
    extends SwarmStructure<T, U, V> {
    get my() { return this._instance.my; }
    get owner() { return this._instance.owner; }
}

export class SwarmExtension extends OwnedSwarmStructure<STRUCTURE_EXTENSION, StructureExtension,
    ExtensionMemory> implements StructureExtension {
    get energy() { return this._instance.energy; }
    get energyCapacity() { return this._instance.energyCapacity; }
    protected OnPrepObject() { }
    protected OnActivate() { }
}

export class SwarmExtractor extends OwnedSwarmStructure<STRUCTURE_EXTRACTOR, StructureExtractor,
    ExtractorMemory> implements StructureExtractor {
    get cooldown() { return this._instance.cooldown; }
    protected OnPrepObject() { }
    protected OnActivate() { }
}

export class SwarmObserver extends OwnedSwarmStructure<STRUCTURE_OBSERVER, StructureObserver,
    ObserverMemory> implements StructureObserver {
    observeRoom(roomName: string) { return this._instance.observeRoom(roomName); }
    protected OnPrepObject() { }
    protected OnActivate() { }
}

export class SwarmLink extends OwnedSwarmStructure<STRUCTURE_LINK, StructureLink,
    LinkMemory> implements StructureLink {
    get cooldown() { return this._instance.cooldown; }
    get energy() { return this._instance.energy; }
    get energyCapacity() { return this._instance.energyCapacity; }

    transferEnergy(target: SwarmLink, amount: number) {
        return this._instance.transferEnergy(target._instance, amount);
    }
    protected OnPrepObject() { }
    protected OnActivate() { }
}

export class SwarmRampart extends OwnedSwarmStructure<STRUCTURE_RAMPART, StructureRampart,
    RampartMemory> implements StructureRampart {
    get isPublic() { return this._instance.isPublic; }
    get ticksToDecay() { return this._instance.ticksToDecay; }

    setPublic(isPublic: boolean) { return this._instance.setPublic(isPublic); }
    protected OnPrepObject() { }
    protected OnActivate() { }
}

export class SwarmStorage extends OwnedSwarmStructure<STRUCTURE_STORAGE, StructureStorage,
    StorageMemory> implements StructureStorage {
    get store() { return this._instance.store; }
    get storeCapacity() { return this._instance.storeCapacity; }
    protected OnPrepObject() { }
    protected OnActivate() { }
}

export class SwarmTerminal extends OwnedSwarmStructure<STRUCTURE_TERMINAL, StructureTerminal,
    TerminalMemory> implements StructureTerminal {
    get cooldown() { return this._instance.cooldown; }
    get store() { return this._instance.store; }
    get storeCapacity() { return this._instance.storeCapacity; }
    protected OnPrepObject() { }
    protected OnActivate() { }

    send(resourceType: ResourceConstant, amount: number, destination: string, description?: string) {
        return this._instance.send(resourceType, amount, destination, description);
    }
}

export class SwarmContainer extends SwarmStructure<STRUCTURE_CONTAINER, StructureContainer,
    ContainerMemory> implements StructureContainer {
    get store() { return this._instance.store; }
    get storeCapacity() { return this._instance.storeCapacity; }
    get ticksToDecay() { return this._instance.ticksToDecay; }
    protected OnPrepObject() { }
    protected OnActivate() { }
}
export class SwarmRoad extends SwarmStructure<STRUCTURE_ROAD, StructureRoad,
    RoadMemory> implements StructureRoad {
    get ticksToDecay() { return this._instance.ticksToDecay };
    protected OnPrepObject() { }
    protected OnActivate() { }
}

export class SwarmWall extends SwarmStructure<STRUCTURE_WALL, StructureWall,
    WallMemory> implements StructureWall {
    get ticksToLive() { return this._instance.ticksToLive; }
    protected OnPrepObject() { }
    protected OnActivate() { }
}

export class SwarmNuker extends OwnedSwarmStructure<STRUCTURE_NUKER, StructureNuker,
    NukerMemory> implements StructureNuker {
    get energy() { return this._instance.energy; }
    get energyCapacity() { return this._instance.energyCapacity; }
    get ghodium() { return this._instance.ghodium; }
    get ghodiumCapacity() { return this._instance.ghodiumCapacity; }
    get cooldown() { return this._instance.cooldown; }
    protected OnPrepObject() { }
    protected OnActivate() { }

    launchNuke(pos: RoomPosition) { return this._instance.launchNuke(pos); }
}

export class SwarmKeepersLair extends OwnedSwarmStructure<STRUCTURE_KEEPER_LAIR, StructureKeeperLair,
    KeepersLairMemory> implements StructureKeeperLair {
    get ticksToSpawn(): number | undefined { return this._instance.ticksToSpawn; }
    protected OnPrepObject() { }
    protected OnActivate() { }
}
export class SwarmPortal extends SwarmStructure<STRUCTURE_PORTAL, StructurePortal,
    PortalMemory> implements StructurePortal {
    get destination(): RoomPosition { return this._instance.destination; }
    get ticksToDecay(): number { return this._instance.ticksToDecay; }
    protected OnPrepObject() { }
    protected OnActivate() { }
}

export class SwarmPowerBank extends SwarmStructure<STRUCTURE_POWER_BANK, StructurePowerBank,
    PowerBankMemory> implements StructurePowerBank {
    get power() { return this._instance.power; }
    get ticksToDecay() { return this._instance.ticksToDecay; }
    protected OnPrepObject() { }
    protected OnActivate() { }
}

export class SwarmPowerSpawn extends OwnedSwarmStructure<STRUCTURE_POWER_SPAWN, StructurePowerSpawn,
    PowerSpawnMemory> implements StructurePowerSpawn {
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