import { SwarmController } from "./SwarmController";
import { InvalidArgumentException } from "Tools/SwarmExceptions";
import { profile } from "Tools/Profiler";
import { StructureMemory } from "SwarmMemory/StorageMemory";

const STRUCTURE_SAVE_PATH = ["structures"];
// PrimeManager<T extends PrimeDataTypes, U extends SwarmType> 
@profile
export class SwarmStructureController extends SwarmController<SwarmControllerDataTypes.Structures, TSwarmStructure>
    implements ISwarmStructureController {
    protected InitNewObj(swarmObj: TSwarmStructure): void {
        // add stuff to the memory for this obj.
    }
    get ControllerType(): SwarmControllerDataTypes.Structures { return SwarmControllerDataTypes.Structures; }
    protected get _dataType(): SwarmControllerDataTypes.Structures {
        return SwarmControllerDataTypes.Structures;
    }
    protected getManagerSavePath(): string[] {
        return STRUCTURE_SAVE_PATH;
    }
    protected GetTypeOf(obj: Structure): SwarmStructureType {
        switch (obj.structureType) {
            case (STRUCTURE_CONTAINER): return SwarmType.SwarmContainer;
            case (STRUCTURE_CONTROLLER): return SwarmType.SwarmController;
            case (STRUCTURE_EXTENSION): return SwarmType.SwarmExtension;
            case (STRUCTURE_EXTRACTOR): return SwarmType.SwarmExtractor;
            case (STRUCTURE_KEEPER_LAIR): return SwarmType.SwarmKeepersLair;
            case (STRUCTURE_LAB): return SwarmType.SwarmLab;
            case (STRUCTURE_LINK): return SwarmType.SwarmLink;
            case (STRUCTURE_NUKER): return SwarmType.SwarmNuker;
            case (STRUCTURE_OBSERVER): return SwarmType.SwarmObserver;
            case (STRUCTURE_PORTAL): return SwarmType.SwarmPortal;
            case (STRUCTURE_POWER_BANK): return SwarmType.SwarmPowerBank;
            case (STRUCTURE_POWER_SPAWN): return SwarmType.SwarmPowerSpawn;
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
    protected OnPrepareSwarm(swarmObj: TSwarmStructure): void {
    }
    protected OnActivateSwarm(swarmObj: TSwarmStructure): void {
        swarmObj.Activate();
    }
    protected OnFinalizeSwarm(swarmObj: TSwarmStructure): void {

    }
    /*private static _instance: SwarmStructureController;
    static GetSwarmObject(id: string) {
        return this._instance.GetSwarmObject(id);
    }
    static PrepareTheSwarm() {
        this._instance = new SwarmStructureController();
        this._instance.PrepareTheSwarm();
    }
    static ActivateSwarm() { this._instance.ActivateSwarm() }
    static FinalizeSwarmActivity() { this._instance.FinalizeSwarmActivity(); }*/
} global["SwarmStructureController"] = SwarmStructureController;