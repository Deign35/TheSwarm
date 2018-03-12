import { NestQueen } from "Queens/NestQueen";
import { RoomMemory } from "Memory/StorageMemory";

export abstract class HiveQueen extends NestQueen implements IQueen {
    LoadCouncil(): IDictionary<IConsul> {
        return super.LoadCouncil();
    }
    LoadCreepController(): CreepManager {
        return super.LoadCreepController();
    }

    // Room functions for hives
    get Controller(): StructureController {
        return this.Nest.controller!;
    }
    get EnergyAvailable(): number {
        return this.Nest.energyAvailable;
    }
    get EnergyAvailableCapacity(): number {
        return this.Nest.energyCapacityAvailable;
    }
}

export class RCL1_HiveQueen extends HiveQueen {
    protected CreateQueenData(): RoomMemory {
        Swarmlord.CreateNewStorageMemory(this.Nest.name, [Swarmlord.StorageMemoryTypeToString(StorageMemoryType.Room)], StorageMemoryType.Room);
        let newMem = new RoomMemory(this.Nest.name,
            [Swarmlord.StorageMemoryTypeToString(StorageMemoryType.Room)]);
        return newMem;
    }
    protected InitQueen(): void {
        super.InitQueen();
    }
}