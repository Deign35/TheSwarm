import { OwnableSwarmObject, SwarmRoomObjectBase } from "SwarmTypes/SwarmTypes";
import { StructureMemory, ExtensionMemory, ExtractorMemory, ObserverMemory, LinkMemory, RampartMemory, StorageMemory, TerminalMemory, ContainerMemory, RoadMemory, WallMemory, NukerMemory, KeepersLairMemory, PortalMemory, PowerBankMemory, PowerSpawnMemory, StructureMemoryBase } from "SwarmMemory/StructureMemory";
import { MemoryBase, SwarmMemoryBase } from "SwarmMemory/SwarmMemory";

export abstract class SwarmStructure<T extends TStructureData, U extends Structure>
    extends SwarmRoomObjectBase<T, U> implements AIStructureBase<T, U>, Structure {
    get hits() { return this._instance.hits; }
    get hitsMax() { return this._instance.hitsMax; }
    get room() { return this._instance.room; }
    get structureType() { return this._instance.structureType; }
    get saveID() { return this.id; }

    destroy() { return this._instance.destroy() }
    isActive() { return this._instance.isActive() }
    notifyWhenAttacked(enabled: boolean = false) { // ActionIntent
        return this._instance.notifyWhenAttacked(enabled) as OK;
    }


    Activate(mem: T, obj: U): T {
        throw new Error("Method not implemented.");
    }
    InitAsNew(obj: U): T {
        throw new Error("Method not implemented.");
    }
    PrepObject(mem: T, obj: U): T {
        throw new Error("Method not implemented.");
    }
}

export abstract class OwnedSwarmStructure<T extends OwnableStructureConstant, U extends OwnedStructure<T>>
    extends SwarmStructure<TOwnabledStructureData, U> {
    get my() { return this._instance.my; }
    get owner() { return this._instance.owner; }
    get structureType(): T { return this._instance.structureType; }
}

export class SwarmExtension extends OwnedSwarmStructure<STRUCTURE_EXTENSION, StructureExtension>
    implements StructureExtension {
    get energy() { return this._instance.energy; }
    get energyCapacity() { return this._instance.energyCapacity; }
}

export class SwarmExtractor extends OwnedSwarmStructure<STRUCTURE_EXTRACTOR, StructureExtractor>
    implements StructureExtractor {
    get cooldown() { return this._instance.cooldown; }
}

export class SwarmObserver extends OwnedSwarmStructure<STRUCTURE_OBSERVER, StructureObserver>
    implements StructureObserver {
    observeRoom(roomName: string) { return this._instance.observeRoom(roomName); }
}

export class SwarmLink extends OwnedSwarmStructure<STRUCTURE_LINK, StructureLink> implements StructureLink {
    get cooldown() { return this._instance.cooldown; }
    get energy() { return this._instance.energy; }
    get energyCapacity() { return this._instance.energyCapacity; }

    transferEnergy(target: SwarmLink, amount: number) {
        return this._instance.transferEnergy(target._instance, amount);
    }
}

export class SwarmRampart extends OwnedSwarmStructure<STRUCTURE_RAMPART, StructureRampart> implements StructureRampart {
    get isPublic() { return this._instance.isPublic; }
    get ticksToDecay() { return this._instance.ticksToDecay; }

    setPublic(isPublic: boolean) { return this._instance.setPublic(isPublic); }
}

export class SwarmStorage extends OwnedSwarmStructure<STRUCTURE_STORAGE, StructureStorage> implements StructureStorage {
    get store() { return this._instance.store; }
    get storeCapacity() { return this._instance.storeCapacity; }
}

export class SwarmTerminal extends OwnedSwarmStructure<STRUCTURE_TERMINAL, StructureTerminal>
    implements StructureTerminal {
    get cooldown() { return this._instance.cooldown; }
    get store() { return this._instance.store; }
    get storeCapacity() { return this._instance.storeCapacity; }

    send(resourceType: ResourceConstant, amount: number, destination: string, description?: string) {
        return this._instance.send(resourceType, amount, destination, description);
    }
}

export class SwarmContainer extends SwarmStructure<IContainerData, StructureContainer> implements AIContainer, StructureContainer {
    get structureType() { return STRUCTURE_CONTAINER; }
    get store() { return this._instance.store; }
    get storeCapacity() { return this._instance.storeCapacity; }
    get ticksToDecay() { return this._instance.ticksToDecay; }
}
export class SwarmRoad extends SwarmStructure<IRoadData, StructureRoad> implements AIRoad, StructureRoad {
    get structureType() { return STRUCTURE_ROAD; }
    get ticksToDecay() { return this._instance.ticksToDecay };
}

export class SwarmWall extends SwarmStructure<IWallData, StructureWall> implements StructureWall {
    get structureType() { return STRUCTURE_WALL; }
    get ticksToLive() { return this._instance.ticksToLive; }
    protected OnPrepObject() { }
    protected OnActivate() { }
}

export class SwarmNuker extends OwnedSwarmStructure<STRUCTURE_NUKER, StructureNuker> implements StructureNuker {
    get energy() { return this._instance.energy; }
    get energyCapacity() { return this._instance.energyCapacity; }
    get ghodium() { return this._instance.ghodium; }
    get ghodiumCapacity() { return this._instance.ghodiumCapacity; }
    get cooldown() { return this._instance.cooldown; }

    launchNuke(pos: RoomPosition) { return this._instance.launchNuke(pos); }
}

export class SwarmKeepersLair extends OwnedSwarmStructure<STRUCTURE_KEEPER_LAIR, StructureKeeperLair>
    implements StructureKeeperLair {
    get ticksToSpawn(): number | undefined { return this._instance.ticksToSpawn; }
}
export class SwarmPortal extends SwarmStructure<IPortalData, StructurePortal> implements StructurePortal {
    get structureType() { return STRUCTURE_PORTAL; }
    get destination(): RoomPosition { return this._instance.destination; }
    get ticksToDecay(): number { return this._instance.ticksToDecay; }
}

export class SwarmPowerBank extends SwarmStructure<IPowerBankData, StructurePowerBank> implements StructurePowerBank {
    get structureType() { return STRUCTURE_POWER_BANK; }
    get power() { return this._instance.power; }
    get ticksToDecay() { return this._instance.ticksToDecay; }
    protected OnPrepObject() { }
    protected OnActivate() { }
}

export class SwarmPowerSpawn extends OwnedSwarmStructure<STRUCTURE_POWER_SPAWN, StructurePowerSpawn> implements StructurePowerSpawn {
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
}