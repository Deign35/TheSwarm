import { SwarmRoomObject } from "SwarmTypes/SwarmTypes";
import { SwarmCreep } from "SwarmTypes/SwarmCreep";
import { SourceMemory } from "SwarmMemory/RoomObjectMemory";
import { profile } from "Tools/Profiler";
import { SwarmLoader } from "./SwarmLoader";
import { HarvestAction } from "Actions/HarvestAction";
import { NoOpAction, ActionBase } from "Actions/ActionBase";
import { BuildAction } from "Actions/BuildAction";
import { MoveToPositionAction } from "Actions/MoveToPositionAction";
import { SwarmContainer } from "./SwarmStructures/SwarmStructure";
import { SwarmSite } from "SwarmTypes/SwarmSite";

const CREEP_ID = 'creepID';
@profile
export class SwarmSource extends SwarmRoomObject<SwarmType.SwarmSource, SourceMemory, Source> implements Source {
    get storageMemoryType() { return SwarmDataType.RoomObject };
    get SwarmType(): SwarmType.SwarmSource { return SwarmType.SwarmSource; }
    get energy() { return this._instance.energy; }
    get energyCapacity() { return this._instance.energyCapacity; }
    get room() { return this._instance.room; }
    get ticksToRegeneration() { return this._instance.ticksToRegeneration; }

    GetRetrievalTarget() {
        // if pile, return pile
        // if link, return none
        // if container, return the container.
    }
}