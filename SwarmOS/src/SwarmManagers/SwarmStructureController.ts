import { SwarmManager } from "./SwarmManager";
import { InvalidArgumentException } from "Tools/SwarmExceptions";
import { profile } from "Tools/Profiler";
import { StructureMemory } from "Memory/StorageMemory";
import { SwarmCreator } from "SwarmTypes/SwarmCreator";

const STRUCTURE_SAVE_PATH = ["structures"];
@profile
export class SwarmStructureController extends SwarmManager<SwarmStructureType, Structure, SwarmDataType.Structure> implements ISwarmStructureController {
    protected getManagerSavePath(): string[] {
        return STRUCTURE_SAVE_PATH;
    }
    protected getSwarmType(obj: Structure): SwarmType {
        switch (obj.structureType) {
            case (STRUCTURE_CONTAINER): return SwarmType.SwarmContainer;
            case (STRUCTURE_CONTROLLER): return SwarmType.SwarmController;
            case (STRUCTURE_EXTENSION): return SwarmType.SwarmExtension;
            case (STRUCTURE_EXTRACTOR): return SwarmType.SwarmExtractor;
            case (STRUCTURE_LAB): return SwarmType.SwarmLab;
            case (STRUCTURE_LINK): return SwarmType.SwarmLink;
            case (STRUCTURE_NUKER): return SwarmType.SwarmNuker;
            case (STRUCTURE_OBSERVER): return SwarmType.SwarmObserver;
            case (STRUCTURE_RAMPART): return SwarmType.SwarmRampart;
            case (STRUCTURE_ROAD): return SwarmType.SwarmRoad;
            case (STRUCTURE_SPAWN): return SwarmType.SwarmSpawn;
            case (STRUCTURE_STORAGE): return SwarmType.SwarmStorage;
            case (STRUCTURE_TERMINAL): return SwarmType.SwarmTerminal;
            case (STRUCTURE_TOWER): return SwarmType.SwarmTower;
            case (STRUCTURE_WALL): return SwarmType.SwarmWall;
        }

        throw new InvalidArgumentException('Structure is not swarm configured: ' + JSON.stringify(obj));
    }
    protected getStorageType(): SwarmDataType.Structure {
        return SwarmDataType.Structure;
    }
    protected FindAllGameObjects(): { [id: string]: Structure; } {
        return Game.structures
    }
    protected OnPrepareSwarm(swarmObj: ISwarmStructure): void {
    }
    protected OnActivateSwarm(swarmObj: ISwarmStructure): void {

    }
    protected OnFinalizeSwarm(swarmObj: ISwarmStructure): void {

    }

    protected CreateSwarmObject(obj: Structure): ISwarmStructure {
        return SwarmCreator.CreateSwarmObject(obj) as ISwarmStructure;
    }
    private static _instance: SwarmStructureController;
    static GetSwarmObject(id: string) {
        return this._instance.GetSwarmObject(id);
    }
    static PrepareTheSwarm() {
        this._instance = new SwarmStructureController();
        this._instance.PrepareTheSwarm();
    }
    static ActivateSwarm() { this._instance.ActivateSwarm() }
    static FinalizeSwarmActivity() { this._instance.FinalizeSwarmActivity(); }
} global["SwarmStructureController"] = SwarmStructureController;