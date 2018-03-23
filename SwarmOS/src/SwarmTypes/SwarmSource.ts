import { RoomObjectMemory } from "SwarmMemory/StorageMemory";
import { SwarmRoomObject } from "SwarmTypes/SwarmTypes";
import { SwarmCreepController } from "SwarmManagers/SwarmCreepManager";
import { SwarmCreep } from "SwarmTypes/SwarmCreep";

export class SwarmSource extends SwarmRoomObject<IRoomObjectMemory, Source> implements ISwarmSource, Source {
    get storageMemoryType() { return SwarmDataType.RoomObject };
    GetSpawnRequirements(): ISpawnRequirement {
        let spawnInfo: ISpawnRequirement = {
            minBody: [WORK, WORK, CARRY, MOVE],
            growthTemplate: [],
            priority: Priority.EMERGENCY,
            neededIn: 0
        };
        let curCreepID = this._memory.GetData<string>('curCreepID');
        if (curCreepID) {
            let creep = SwarmCreepController.GetSwarmObject(curCreepID) as SwarmCreep;
            if (creep) {
                let spawnBuffer = this._memory.GetData<number>('buffer') || 30;
                spawnInfo.neededIn = creep.ticksToLive - spawnBuffer;
            }
        }
        if (this.room.energyCapacityAvailable > 300) {
        }
        // find out how much energy I have available.  Adjust body accordingly
        let body = [WORK, WORK, CARRY, MOVE];
        // find out how soon my current one is going to die
        let neededIn = 1500 - 0;
        // use neededIn to determine 
        return {
            growthTemplate: [],
            minBody: [],
            priority: 0,
            neededIn: 0
        }
    }
    get SwarmType(): SwarmType.SwarmSource { return SwarmType.SwarmSource; }
    get energy() { return this._instance.energy; }
    get energyCapacity() { return this._instance.energyCapacity; }
    get room() { return this._instance.room; }
    get ticksToRegeneration() { return this._instance.ticksToRegeneration; }

    //protected data!: ISourceData;
    protected OnActivate() {
    }
}