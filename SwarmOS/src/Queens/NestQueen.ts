import { RoomMemory, StorageMemory } from "Memory/StorageMemory";
import { MemoryNotFoundException, SwarmException, NotImplementedException } from "Tools/SwarmExceptions";
import { profile } from "Tools/Profiler";
import { SwarmRoom } from "SwarmObjects/SwarmRoom";
import { SwarmCreator } from "SwarmObjects/SwarmCreator";
import { SwarmObject } from "SwarmObjects/SwarmObject";

const HARVESTER_JOBS = 'HARVEST'
@profile
export abstract class NestQueen implements IQueen {
    constructor(room: Room) {
        this.Nest = SwarmCreator.CreateSwarmObject(room, SwarmType.SwarmRoom) as TSwarmRoom;
        this.roomObjects = {};
    }
    Nest: TSwarmRoom;

    protected queenMemory!: RoomMemory;
    protected roomObjects: { [id: string]: TSwarmObject<RoomObject, SwarmType> };

    get QueenType() { return QueenType.Larva }
    protected abstract CheckForSpawnRequirements(): void;
    protected InitForTick() {
        let harvestTargets = this.queenMemory.GetData<SourceData[]>(HARVESTER_JOBS);
        for (let i = 0; i < harvestTargets.length; i++) {
            let target = Game.getObjectById(harvestTargets[i].sourceID)! as Source;
            let sourceObj = SwarmCreator.CreateSwarmObject(target, SwarmType.SwarmSource) as TSwarmSource;
            sourceObj.AssignData(harvestTargets[i]);
            this.roomObjects[target.id] = sourceObj;
        }
    }
    InitializeQueen() {
        let harvesterJobs = [];
        let sources = this.Nest.find(FIND_SOURCES);
        for (let i = 0; i < sources.length; i++) {
            let newSourceMemory: SourceData = {
                sourceID: sources[i].id,
                nextSpawnRequiredBy: 0,
            };
            harvesterJobs.push(newSourceMemory);
        }

        this.queenMemory.SetData(HARVESTER_JOBS, harvesterJobs);
    }
    /** 
     * Loads all the needed components with fresh data
    */
    StartTick(): void {
        this.InitForTick();
        this.CheckForSpawnRequirements();
    }
    ProcessTick(): void {
        for (let id in this.roomObjects) {
            let roomObj = this.roomObjects[id];
            roomObj.Activate();
        }
    }
    EndTick(): void {
    }

    ReceiveCommand() {
    }
}