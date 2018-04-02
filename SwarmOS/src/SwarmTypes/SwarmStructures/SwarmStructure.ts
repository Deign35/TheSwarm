import { StructureMemory, TStructureMemory } from "SwarmMemory/StorageMemory";
import { NotifiableSwarmObject, OwnableSwarmObject } from "SwarmTypes/SwarmTypes";

//<T extends StructureConstant > extends ISwarmObject < TStructureMemory, Structure < T >>
export abstract class SwarmStructure<T extends StructureConstant, U extends Structure<T>, V extends TStructureMemory>
    extends NotifiableSwarmObject<U, V> implements Structure<T> {
    get hits() { return this._instance.hits; }
    get hitsMax() { return this._instance.hitsMax; }
    get room() { return this._instance.room; }
    get structureType(): T { return this._instance.structureType; }
    get saveID() { return this.id; }

    destroy() { return this._instance.destroy() }
    isActive() { return this._instance.isActive() }
}

export abstract class OwnedSwarmStructure<T extends OwnableStructureConstant, U extends OwnedStructure<T>, V extends TStructureMemory>
    extends SwarmStructure<T, U, V> {
    get my() { return this._instance.my; }
    get owner() { return this._instance.owner; }
}

export class SwarmExtension extends OwnedSwarmStructure<STRUCTURE_EXTENSION, StructureExtension,
    StructureMemory<SwarmType.SwarmExtension>> implements StructureExtension {
    get SwarmType(): SwarmType.SwarmExtension { return SwarmType.SwarmExtension; }
    get energy() { return this._instance.energy; }
    get energyCapacity() { return this._instance.energyCapacity; }
    protected OnActivate() {
        console.log("Successfully activated an Extension");
    }
}

export class SwarmExtractor extends OwnedSwarmStructure<STRUCTURE_EXTRACTOR, StructureExtractor,
    StructureMemory<SwarmType.SwarmExtractor>> implements StructureExtractor {
    get SwarmType(): SwarmType.SwarmExtractor { return SwarmType.SwarmExtractor; }
    get cooldown() { return this._instance.cooldown; }
    protected OnActivate() {
        console.log("Successfully activated an Extactor");
    }
}

export class SwarmObserver extends OwnedSwarmStructure<STRUCTURE_OBSERVER, StructureObserver,
    StructureMemory<SwarmType.SwarmObserver>> implements StructureObserver {
    get SwarmType(): SwarmType.SwarmObserver { return SwarmType.SwarmObserver; }
    observeRoom(roomName: string) { return this._instance.observeRoom(roomName); }
    protected OnActivate() {
        console.log("Successfully activated an Observer");
    }
}

export class SwarmLink extends OwnedSwarmStructure<STRUCTURE_LINK, StructureLink,
    StructureMemory<SwarmType.SwarmLink>> implements StructureLink {
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

export class SwarmRampart extends OwnedSwarmStructure<STRUCTURE_RAMPART, StructureRampart,
    StructureMemory<SwarmType.SwarmRampart>> implements StructureRampart {
    get SwarmType(): SwarmType.SwarmRampart { return SwarmType.SwarmRampart; }
    get isPublic() { return this._instance.isPublic; }
    get ticksToDecay() { return this._instance.ticksToDecay; }

    setPublic(isPublic: boolean) { return this._instance.setPublic(isPublic); }
    protected OnActivate() {
        console.log("Successfully activated a Rampart");
    }
}

export class SwarmStorage extends OwnedSwarmStructure<STRUCTURE_STORAGE, StructureStorage,
    StructureMemory<SwarmType.SwarmStorage>> implements StructureStorage {
    get SwarmType(): SwarmType.SwarmStorage { return SwarmType.SwarmStorage; }
    get store() { return this._instance.store; }
    get storeCapacity() { return this._instance.storeCapacity; }
    protected OnActivate() {
        console.log("Successfully activated a Storage");
    }
}

export class SwarmTerminal extends OwnedSwarmStructure<STRUCTURE_TERMINAL, StructureTerminal,
    StructureMemory<SwarmType.SwarmTerminal>> implements StructureTerminal {
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

export class SwarmContainer extends SwarmStructure<STRUCTURE_CONTAINER, StructureContainer,
    StructureMemory<SwarmType.SwarmContainer>> implements StructureContainer {
    get SwarmType(): SwarmType.SwarmContainer { return SwarmType.SwarmContainer; }
    get store() { return this._instance.store; }
    get storeCapacity() { return this._instance.storeCapacity; }
    get ticksToDecay() { return this._instance.ticksToDecay; }
    protected OnActivate() {
        console.log("Successfully activated a Container");
    }
}
export class SwarmRoad extends SwarmStructure<STRUCTURE_ROAD, StructureRoad,
    StructureMemory<SwarmType.SwarmRoad>> implements StructureRoad {
    get SwarmType(): SwarmType.SwarmRoad { return SwarmType.SwarmRoad; }
    get ticksToDecay() { return this._instance.ticksToDecay };
    protected OnActivate() {
        console.log("Successfully activated a Road");
    }
}

export class SwarmWall extends SwarmStructure<STRUCTURE_WALL, StructureWall,
    StructureMemory<SwarmType.SwarmWall>> implements StructureWall {
    get SwarmType(): SwarmType.SwarmWall { return SwarmType.SwarmWall; }
    get ticksToLive() { return this._instance.ticksToLive; }
    protected OnActivate() {
        console.log("Successfully activated a Wall");
    }
}

export class SwarmNuker extends OwnedSwarmStructure<STRUCTURE_NUKER, StructureNuker,
    StructureMemory<SwarmType.SwarmNuker>> implements StructureNuker {
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

export class SwarmKeepersLair extends OwnedSwarmStructure<STRUCTURE_KEEPER_LAIR, StructureKeeperLair,
    StructureMemory<SwarmType.SwarmKeepersLair>> implements StructureKeeperLair {
    get ticksToSpawn(): number | undefined { return this._instance.ticksToSpawn; }
    protected OnActivate() {
        console.log("Successfully activated a KeepersLair");
    }
}
export class SwarmPortal extends SwarmStructure<STRUCTURE_PORTAL, StructurePortal,
    StructureMemory<SwarmType.SwarmPortal>> implements StructurePortal {
    get destination(): RoomPosition { return this._instance.destination; }
    get ticksToDecay(): number { return this._instance.ticksToDecay; }
    protected OnActivate() {
        console.log("Successfully activated a Portal");
    }
}

export class SwarmPowerBank extends SwarmStructure<STRUCTURE_POWER_BANK, StructurePowerBank,
    StructureMemory<SwarmType.SwarmPowerBank>> implements StructurePowerBank {
    get power() { return this._instance.power; }
    get ticksToDecay() { return this._instance.ticksToDecay; }
    protected OnActivate() {
        console.log("Successfully activated a PowerBank");
    }
}

export class SwarmPowerSpawn extends OwnedSwarmStructure<STRUCTURE_POWER_SPAWN, StructurePowerSpawn,
    StructureMemory<SwarmType.SwarmPowerSpawn>> implements StructurePowerSpawn {
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