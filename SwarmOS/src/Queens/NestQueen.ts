import { RoomMemory, StorageMemory } from "Memory/StorageMemory";
import { MemoryNotFoundException, SwarmException, NotImplementedException } from "Tools/SwarmExceptions";
import { profile } from "Tools/Profiler";
import { SwarmRoom } from "SwarmObjects/SwarmRoom";
import { SwarmCreator } from "SwarmObjects/SwarmCreator";

@profile
export abstract class NestQueen implements IQueen {
    constructor(room: Room) {
        this.Nest = SwarmCreator.CreateSwarmObject(room, SwarmType.SwarmRoom) as TSwarmRoom;
    }
    Nest: TSwarmRoom;
    //Council!: IDictionary<IConsul>;
    //CreepController!: ICreepManager;

    protected queenMemory!: RoomMemory;

    get QueenType() { return QueenType.Larva }
    protected abstract CheckForSpawnRequirements(): void;
    protected InitForTick() {
    }
    /*LoadCouncil(): IDictionary<IConsul> {
        return {};
        //throw new NotImplementedException('Cannot load council yet');
    }
    /*LoadCreepController(): ICreepManager {
        //return {};
        throw new NotImplementedException('CreepController doesnt exist');
    }*/

    /** 
     * Loads all the needed components with fresh data
    */
    StartTick(): void {
        this.InitForTick();
        //this.CreepController = this.LoadCreepController();
        //this.Council = this.LoadCouncil();
        this.CheckForSpawnRequirements();
    }
    ProcessTick(): void {
    }
    EndTick(): void {
    }

    ReceiveCommand() {
    }
}