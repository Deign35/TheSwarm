export const OSPackage: IPackage<SpawnRegistry_Memory> = {
    install(processRegistry: IProcessRegistry, extensionRegistry: IExtensionRegistry) {
        processRegistry.register(CJ_Boot, BootstrapJob);
    }
}
import { BasicProcess } from "Core/BasicTypes";

// (TODO): Search for buildings
class BootstrapJob extends BasicProcess<BootstrapRefiller_Memory> {
    @extensionInterface(EXT_CreepRegistry)
    creepRegistry!: ICreepRegistryExtensions;
    @extensionInterface(EXT_RoomView)
    protected View!: IRoomDataExtension;
    @extensionInterface(EXT_CreepActivity)
    protected creepActivity!: ICreepActivityExtensions;

    get room(): Room | undefined { return Game.rooms[this.memory.rID] };
    get roomData() { return this.View.GetRoomData(this.memory.rID); }

    RunThread(): ThreadState {
        if (!this.memory.r || !this.kernel.getProcessByPID(this.memory.r)) {

        }


        return ThreadState_Done;
    }

    CreateRefillerSpawnActivity() {
        let sID = this.spawnRegistry.requestSpawn({
            ct: CT_Worker,
            l: 0,
            n: this.memory.rID + '_BSR_' + this.memory.s.slice(-3),
        }, this.memory.rID, Priority_Highest, 1, {
                ct: CT_Worker,
                lvl: 0
            });
        this.memory.r = this.kernel.startProcess(SPKG_SpawnActivity, {
            sID: sID,
            HC: 'RefillSpawnComplete'
        });
        this.kernel.setParent(this.memory.r, this.pid);
    }

    RefillSpawnComplete(creepID: string) {
        if (this.creepRegistry.tryReserveCreep(creepID, this.pid)) {
            this.memory.refiller = this.creepActivity.CreateNewCreepActivity({
            })
        }
    }

    SpawnComplete(creepID: string) {
        this.memory.hasSpawnRequest = false;
        this.creeps[creepID] = {};
        this.CreateActivity(creepID);
    }

    CreateActivity(creepID: string) {
        if (this.creepRegistry.tryReserveCreep(creepID, this.pid)) {
            this.creeps[creepID].a = this.creepActivity.CreateNewCreepActivity({
                at: AT_Harvest,
                c: creepID,
                HC: 'ActivityComplete',
                t: this.memory.t
            }, this.pid, this.extensions);
        }
    }
    ActivityComplete(creepID: string) {
        let creep = this.creepRegistry.tryGetCreep(creepID);
        if (creep) {
            this.CreateActivity(creepID);
        } else {
            delete this.memory.h;
        }
    }
}