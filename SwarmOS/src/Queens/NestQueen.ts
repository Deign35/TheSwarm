import { RoomMemory, StorageMemory } from "Memory/StorageMemory";
import { MemoryNotFoundException, SwarmException, NotImplementedException } from "Tools/SwarmExceptions";

export abstract class NestQueen implements IQueen {
    constructor(protected Nest: Room) { }
    Council!: IDictionary<IConsul>;
    CreepController!: ICreepManager;
    protected queenMemory!: RoomMemory;
    get QueenType() { return QueenType.Larva }
    protected InitForTick() {
        try {
            this.queenMemory = Swarmlord.CheckoutMemory(this.Nest.name,
                [Swarmlord.StorageMemoryTypeToString(StorageMemoryType.Room)], StorageMemoryType.Room);
        } catch (error) {
            if (error.name != MemoryNotFoundException.ErrorName) {
                throw new SwarmException('InitForTick', error.name + '_' + error.message);
            }
            this.InitQueen();
            this.queenMemory = Swarmlord.CheckoutMemory(this.Nest.name,
                [Swarmlord.StorageMemoryTypeToString(StorageMemoryType.Room)], StorageMemoryType.Room);
        }
    }
    protected abstract CreateQueenData(): RoomMemory;
    protected abstract CheckForSpawnRequirements(): void;

    protected InitQueen(): void {
        this.queenMemory = this.CreateQueenData();
    }
    LoadCouncil(): IDictionary<IConsul> {
        return {};
        //throw new NotImplementedException('Cannot load council yet');
    }
    LoadCreepController(): ICreepManager {
        return {};
        //throw new NotImplementedException('CreepController doesnt exist');
    }

    /** 
     * Loads all the needed components with fresh data
    */
    StartTick(): void {
        this.InitForTick();
        this.CreepController = this.LoadCreepController();
        this.Council = this.LoadCouncil();
        this.CheckForSpawnRequirements();
    }
    ProcessTick(): void {
    }
    EndTick(): void {
        Swarmlord.ReleaseMemory(this.queenMemory, true);
    }

    ReceiveCommand() {
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