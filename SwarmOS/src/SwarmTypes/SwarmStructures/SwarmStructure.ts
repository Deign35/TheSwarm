import { OwnableSwarmObject, SwarmRoomObjectBase } from "SwarmTypes/SwarmTypes";

export type SwarmStructure = SwarmStructureBase<StructureConstant, Structure>;
export abstract class SwarmStructureBase<T extends StructureConstant, U extends Structure>
    extends SwarmRoomObjectBase<IData, U> implements AIStructureBase<TStructureData, U>, Structure {
    get prototype() { return this._instance; }
    get hits() { return this._instance.hits; }
    get hitsMax() { return this._instance.hitsMax; }
    get room() { return this._instance.room; }
    get structureType(): T { return this._instance.structureType as T; }

    destroy() { return this._instance.destroy() }
    isActive() { return this._instance.isActive() }
    notifyWhenAttacked(enabled: boolean = false) { // ActionIntent
        return this._instance.notifyWhenAttacked(enabled) as OK;
    }
}

export abstract class OwnedSwarmStructure<T extends OwnableStructureConstant, U extends OwnedStructure<T>>
    extends SwarmStructureBase<T, U> {
    get my() { return this._instance.my; }
    get owner() { return this._instance.owner; }
}

export class SwarmContainer extends SwarmStructureBase<STRUCTURE_CONTAINER, StructureContainer>
    implements AIContainer, StructureContainer {
    get store() { return this._instance.store; }
    get storeCapacity() { return this._instance.storeCapacity; }
    get ticksToDecay() { return this._instance.ticksToDecay; }
}

export class SwarmExtension extends OwnedSwarmStructure<STRUCTURE_EXTENSION, StructureExtension>
    implements AIExtension, StructureExtension {
    get energy() { return this._instance.energy; }
    get energyCapacity() { return this._instance.energyCapacity; }
}

export class SwarmExtractor extends OwnedSwarmStructure<STRUCTURE_EXTRACTOR, StructureExtractor>
    implements AIExtractor, StructureExtractor {
    get cooldown() { return this._instance.cooldown; }
}

export class SwarmKeepersLair extends OwnedSwarmStructure<STRUCTURE_KEEPER_LAIR, StructureKeeperLair>
    implements AIKeepersLair, StructureKeeperLair {
    get ticksToSpawn(): number | undefined { return this._instance.ticksToSpawn; }
}

export class SwarmLink extends OwnedSwarmStructure<STRUCTURE_LINK, StructureLink> implements AILink, StructureLink {
    get cooldown() { return this._instance.cooldown; }
    get energy() { return this._instance.energy; }
    get energyCapacity() { return this._instance.energyCapacity; }

    transferEnergy(target: SwarmLink, amount: number) {
        return this._instance.transferEnergy(target._instance, amount);
    }
}

export class SwarmNuker extends OwnedSwarmStructure<STRUCTURE_NUKER, StructureNuker>
    implements AINuker, StructureNuker {
    get energy() { return this._instance.energy; }
    get energyCapacity() { return this._instance.energyCapacity; }
    get ghodium() { return this._instance.ghodium; }
    get ghodiumCapacity() { return this._instance.ghodiumCapacity; }
    get cooldown() { return this._instance.cooldown; }

    launchNuke(pos: RoomPosition) { return this._instance.launchNuke(pos); }
}

export class SwarmObserver extends OwnedSwarmStructure<STRUCTURE_OBSERVER, StructureObserver>
    implements AIObserver, StructureObserver {
    observeRoom(roomName: string) { return this._instance.observeRoom(roomName); }
}

export class SwarmPortal extends SwarmStructureBase<STRUCTURE_PORTAL, StructurePortal>
    implements AIPortal, StructurePortal {
    get destination(): RoomPosition { return this._instance.destination; }
    get ticksToDecay(): number { return this._instance.ticksToDecay; }
}

export class SwarmPowerBank extends SwarmStructureBase<STRUCTURE_POWER_BANK, StructurePowerBank>
    implements AIPowerBank, StructurePowerBank {
    get power() { return this._instance.power; }
    get ticksToDecay() { return this._instance.ticksToDecay; }
}

export class SwarmPowerSpawn extends OwnedSwarmStructure<STRUCTURE_POWER_SPAWN, StructurePowerSpawn>
    implements AIPowerSpawn, StructurePowerSpawn {
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

export class SwarmRampart extends OwnedSwarmStructure<STRUCTURE_RAMPART, StructureRampart>
    implements AIRampart, StructureRampart {
    get isPublic() { return this._instance.isPublic; }
    get ticksToDecay() { return this._instance.ticksToDecay; }

    setPublic(isPublic: boolean) { return this._instance.setPublic(isPublic); }
}

export class SwarmRoad extends SwarmStructureBase<STRUCTURE_ROAD, StructureRoad>
    implements AIRoad, StructureRoad {
    get ticksToDecay() { return this._instance.ticksToDecay };
}

export class SwarmStorage extends OwnedSwarmStructure<STRUCTURE_STORAGE, StructureStorage>
    implements AIStorage, StructureStorage {
    get store() { return this._instance.store; }
    get storeCapacity() { return this._instance.storeCapacity; }
}

export class SwarmTerminal extends OwnedSwarmStructure<STRUCTURE_TERMINAL, StructureTerminal>
    implements AITerminal, StructureTerminal {
    get cooldown() { return this._instance.cooldown; }
    get store() { return this._instance.store; }
    get storeCapacity() { return this._instance.storeCapacity; }

    send(resourceType: ResourceConstant, amount: number, destination: string, description?: string) {
        return this._instance.send(resourceType, amount, destination, description);
    }
}

export class SwarmWall extends SwarmStructureBase<STRUCTURE_WALL, StructureWall>
    implements AIWall, StructureWall {
    get ticksToLive() { return this._instance.ticksToLive; }
}