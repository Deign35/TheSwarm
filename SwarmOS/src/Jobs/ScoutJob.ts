export const OSPackage: IPackage<SpawnRegistry_Memory> = {
    install(processRegistry: IProcessRegistry, extensionRegistry: IExtensionRegistry) {
        processRegistry.register(CJ_Scout, ScoutJob);
    }
}
import { BasicProcess } from "Core/BasicTypes";

// (TODO): Search for buildings
class ScoutJob extends BasicProcess<ScoutJob_Memory> {
    @extensionInterface(EXT_CreepRegistry)
    creepRegistry!: ICreepRegistryExtensions;
    @extensionInterface(EXT_RoomView)
    protected View!: IRoomDataExtension;
    @extensionInterface(EXT_CreepActivity)
    protected creepActivity!: ICreepActivityExtensions;

    RunThread(): ThreadState {
        let creep = this.creepRegistry.tryGetCreep(this.memory.c, this.pid) as Creep | undefined;
        if (creep && !creep.spawning) {
            if (!this.memory.a || !this.kernel.getProcessByPID(this.memory.a)) {
                this.CreateNewScoutActivity(this.memory.c!);
            }
        }

        if (!creep) {
            if (!this.memory.a || !this.kernel.getProcessByPID(this.memory.a)) {
                this.CreateSpawnActivity();
            }
        }

        return ThreadState_Done;
    }

    CreateSpawnActivity() {
        let creepID = this.memory.rID + (Game.time + '_s').slice(-5);
        let sID = this.spawnRegistry.requestSpawn({
            l: 0,
            ct: CT_Scout,
            n: creepID
        }, this.memory.rID, Priority_Lowest, 1, {
                ct: CT_Scout,
                lvl: 0
            });
        let spawnMem: SpawnActivity_Memory = {
            sID: sID,
            HC: 'CreateNewScoutActivity'
        }
        this.memory.a = this.kernel.startProcess(SPKG_SpawnActivity, spawnMem)
        this.kernel.setParent(this.memory.a, this.pid);
    }

    CreateNewScoutActivity(creepID: CreepID) {
        this.creepRegistry.tryReserveCreep(creepID, this.pid);
        let creep = this.creepRegistry.tryGetCreep(creepID, this.pid);
        if (!creep) {
            this.CreateSpawnActivity();
            return;
        }

        let allRooms = this.memory.n;
        let nextRoom = this.memory.rID;
        let bestRoom: RoomState | undefined = undefined;
        for (let i = 0; i < allRooms.length; i++) {
            let data = this.View.GetRoomData(allRooms[i]);
            if (!data) {
                nextRoom = allRooms[i];
                break;
            }

            if (bestRoom) {
                if (bestRoom.lastUpdated <= data.lastUpdated) {
                    continue;
                }
            }

            bestRoom = data;
            nextRoom = allRooms[i];
        }

        this.memory.a = this.creepActivity.CreateNewCreepActivity({
            at: AT_MoveToPosition,
            p: {
                x: 25,
                y: 25,
                roomName: nextRoom
            },
            c: creep.name,
            e: [],
            HC: 'CreateNewScoutActivity'
        }, this.pid);
    }
}