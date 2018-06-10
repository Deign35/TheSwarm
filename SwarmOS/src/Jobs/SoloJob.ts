import { BasicProcess } from "Core/BasicTypes";

export abstract class SoloJob extends BasicProcess<SoloJob_Memory> {
    @extensionInterface(EXT_CreepRegistry)
    creepRegistry!: ICreepRegistryExtensions;

    RunThread(): ThreadState {
        let creep = this.creepRegistry.tryGetCreep(this.memory.c, this.pid) as Creep | undefined;
        if (creep && !creep.spawning) {
            if (!this.memory.a || !this.kernel.getProcessByPID(this.memory.a)) {
                this.CreateCreepActivity(this.memory.c!);
            }
        }

        if (!creep) {
            if (!this.memory.a) {
                this.CreateSpawnActivity();
            } else if (!this.kernel.getProcessByPID(this.memory.a)) {
                if (this.memory.exp) {
                    this.EndProcess();
                } else {
                    this.CreateSpawnActivity();
                }
            }
        }

        return ThreadState_Done;
    }

    CreateSpawnActivity() {
        let spawnData = this.GetSpawnData();
        let sID = this.spawnRegistry.requestSpawn(spawnData, this.memory.rID, Priority_Lowest, 1, {
            ct: spawnData.ct,
            lvl: spawnData.l
        });
        let spawnMem: SpawnActivity_Memory = {
            sID: sID,
            HC: 'CreateCreepActivity'
        }
        this.memory.a = this.kernel.startProcess(SPKG_SpawnActivity, spawnMem)
        this.kernel.setParent(this.memory.a, this.pid);
    }
    protected abstract GetSpawnData(): { ct: CT_ALL, l: number, n: CreepID };

    CreateCreepActivity(creepID: CreepID) {
        this.creepRegistry.tryReserveCreep(creepID, this.pid);
        let creep = this.creepRegistry.tryGetCreep(creepID, this.pid);
        if (!creep) {
            return;
        }
        this.memory.a = this.CreateCustomCreepActivity(creep);
    }
    protected abstract CreateCustomCreepActivity(creep: Creep): PID | undefined;

}