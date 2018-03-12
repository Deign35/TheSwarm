import { NestQueen } from "Queens/NestQueen";
import { RoomMemory } from "Memory/StorageMemory";

export abstract class HiveQueen extends NestQueen implements IQueen {
    LoadCouncil(): IDictionary<IConsul> {
        return super.LoadCouncil();
    }
    /*LoadCreepController(): ICreepManager {
        return super.LoadCreepController();
    }*/
}

export class RCL1_HiveQueen extends HiveQueen {
    protected CheckForSpawnRequirements(): void {
        // Ask the council
    }
    protected CreateQueenData(): RoomMemory {
        Swarmlord.CreateNewStorageMemory(this.Nest.name, [Swarmlord.StorageMemoryTypeToString(StorageMemoryType.Room)], StorageMemoryType.Room);
        let newMem = Swarmlord.CheckoutMemory<RoomData, RoomMemory>(this.Nest.name, [Swarmlord.StorageMemoryTypeToString(StorageMemoryType.Room)], StorageMemoryType.Room);
        return newMem;
    }
    protected InitQueen(): void {
        super.InitQueen();
    }
}