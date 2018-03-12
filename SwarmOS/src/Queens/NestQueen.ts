import { RoomMemory, StorageMemory } from "Memory/StorageMemory";
import { MemoryNotFoundException, SwarmException, NotImplementedException } from "Tools/SwarmExceptions";

export abstract class NestQueen implements IQueen {
    StartTick(): void {
        this.InitForTick();
    }
    ProcessTick(): void {
        //throw new Error("Method not implemented.");
    }
    EndTick(): void {
        //throw new Error("Method not implemented.");
    }
    constructor(protected Nest: Room) {
        this.InitForTick();
        this.Council = this.LoadCouncil();
        this.CreepController = this.LoadCreepController();
    }
    Council: IDictionary<IConsul>;
    CreepController: CreepManager;
    protected queenMemory!: RoomMemory;
    get QueenType() { return QueenType.Larva }
    ReceiveCommand() {
    }
    protected InitForTick() {
        try {
            this.queenMemory = Swarmlord.CheckoutMemory(this.Nest.name,
                [Swarmlord.StorageMemoryTypeToString(StorageMemoryType.Room)]) as RoomMemory;
        } catch (error) {
            if (error.name != MemoryNotFoundException.ErrorName) {
                throw new SwarmException('InitForTick', error.name + '_' + error.message);
            }
            this.InitQueen();
            this.queenMemory = Swarmlord.CheckoutMemory(this.Nest.name,
                [Swarmlord.StorageMemoryTypeToString(StorageMemoryType.Room)]) as RoomMemory;
        }
    }

    protected abstract CreateQueenData(): RoomMemory;
    protected InitQueen(): void {
        this.queenMemory = this.CreateQueenData();
    }
    LoadCouncil(): IDictionary<IConsul> {
        return {};
        //throw new NotImplementedException('Cannot load council yet');
    }
    LoadCreepController(): CreepManager {
        return {};
        //throw new NotImplementedException('CreepController doesnt exist');
    }

    // Access to the normal room functions.
    get Controller(): StructureController | undefined {
        return this.Nest.controller;
    }
    get EnergyAvailable(): number {
        return 0;
    }
    get EnergyAvailableCapacity(): number {
        return 0;
    }
    get QueenLocation(): RoomLocationFormat {
        return this.Nest.name;
    }
}

declare type RoomLocationFormat = string;