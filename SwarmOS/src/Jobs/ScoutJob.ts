export const OSPackage: IPackage<SpawnRegistry_Memory> = {
    install(processRegistry: IProcessRegistry, extensionRegistry: IExtensionRegistry) {
        processRegistry.register(CJ_Scout, ScoutJob);
    }
}
import { BasicProcess } from "Core/BasicTypes";

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
            if (creep.room.name == this.memory.t) {
                this.kernel.killProcess(this.memory.a);
                this.memory.t = undefined;
                this.memory.a = undefined;
                this.CreateNewScoutActivity(creep.name);
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
        if (this.memory.a) {
            this.kernel.killProcess(this.memory.a);
            delete this.memory.a;
        }
        let creepID = this.memory.rID + (Game.time + '_s').slice(-5);
        let sID = this.spawnRegistry.requestSpawn({
            l: 0,
            c: CT_Scout,
            n: creepID,
            p: this.pid
        }, this.memory.rID, Priority_Lowest, 1, {
                ct: CT_Scout,
                lvl: 0,
                p: this.pid
            });
        let spawnMem: SpawnActivity_Memory = {
            sID: sID,
            HC: 'CreateNewScoutActivity'
        }
        this.memory.a = this.kernel.startProcess(SPKG_SpawnActivity, spawnMem)
        this.kernel.setParent(this.memory.a, this.pid);
    }

    CreateNewScoutActivity(creepID: CreepID) {
        if (this.memory.a) {
            this.kernel.killProcess(this.memory.a);
            delete this.memory.a;
        }
        this.creepRegistry.tryReserveCreep(creepID, this.pid);
        let creep = this.creepRegistry.tryGetCreep(creepID, this.pid);
        if (!creep) {
            this.CreateSpawnActivity();
            return;
        }

        if (creep.room.controller && (!creep.room.controller.sign || creep.room.controller.sign.text != MY_SIGNATURE)) {
            this.memory.a = this.creepActivity.CreateNewCreepActivity({
                t: creep.room.controller.id,
                at: AT_SignController,
                c: creepID,
                m: MY_SIGNATURE,
                HC: 'CreateNewScoutActivity'
            }, this.pid);
            delete this.memory.t;
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

        this.memory.t = nextRoom;
        this.memory.a = this.creepActivity.CreateNewCreepActivity({
            at: AT_MoveToPosition,
            p: {
                x: 25,
                y: 25,
                roomName: this.memory.t
            },
            c: creep.name,
            HC: 'CreateNewScoutActivity'
        }, this.pid);
    }
}