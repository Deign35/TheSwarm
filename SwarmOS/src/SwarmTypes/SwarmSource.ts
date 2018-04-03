import { SwarmRoomObject } from "SwarmTypes/SwarmTypes";
import { SwarmCreep } from "SwarmTypes/SwarmCreep";
import { SourceMemory } from "SwarmMemory/RoomObjectMemory";
import { profile } from "Tools/Profiler";
import { SwarmLoader } from "./SwarmLoader";
import { HarvestAction } from "Actions/HarvestAction";

@profile
export class SwarmSource extends SwarmRoomObject<Source, SourceMemory> implements Source {
    get storageMemoryType() { return SwarmDataType.RoomObject };
    get SwarmType(): SwarmType.SwarmSource { return SwarmType.SwarmSource; }
    get energy() { return this._instance.energy; }
    get energyCapacity() { return this._instance.energyCapacity; }
    get room() { return this._instance.room; }
    get ticksToRegeneration() { return this._instance.ticksToRegeneration; }
    protected OnActivate() {
    }
    protected OnPrepObject() {
        if (!this.memory.creepID) {
            if (SwarmLoader.TheSwarm.rooms[this.room.name].TrySpawn([WORK, WORK, CARRY, MOVE], 'somestring') == OK) {
                this.memory.SetData('creepID', 'somestring');
            }
            return;
        }

        let creep = SwarmLoader.TheSwarm.creeps[this.memory.creepID];
        if (!creep) {
            this.memory.RemoveData('creepID');
            return;
        }
        let harvestAction = new HarvestAction(creep, this.GetObjectInstance());
        harvestAction.Run();
    }
}