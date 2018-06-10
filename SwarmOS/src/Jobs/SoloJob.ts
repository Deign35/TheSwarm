import { BasicProcess } from "Core/BasicTypes";

export abstract class SoloJob<T extends SoloJob_Memory> extends BasicProcess<T> {
    @extensionInterface(EXT_CreepRegistry)
    creepRegistry!: ICreepRegistryExtensions;

    protected get energyTargets() {
        return this.memory.et;
    }
    protected get homeRoom(): Room {
        return Game.rooms[this.memory.rID];
    }
    protected get targets() {
        return this.memory.wt;
    }
    protected creep: Creep | undefined;

    RunThread(): ThreadState {
        this.creep = this.creepRegistry.tryGetCreep(this.memory.c, this.pid) as Creep | undefined;
        if (this.creep && !this.creep.spawning) {
            if (!this.memory.a || !this.kernel.getProcessByPID(this.memory.a)) {
                this.CreateCreepActivity(this.memory.c!);
            }
        }

        if (!this.creep) {
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
        this.creep = this.creepRegistry.tryGetCreep(creepID, this.pid);
        if (!this.creep) {
            if (this.memory.exp) {
                this.EndProcess();
            } else {
                this.CreateSpawnActivity();
            }
            return;
        }
        this.memory.a = this.CreateCustomCreepActivity(this.creep);
        if (!this.memory.a) {
            this.EndProcess();
        } else {
            this.kernel.setParent(this.memory.a, this.pid);
        }
    }
    protected abstract CreateCustomCreepActivity(creep: Creep): PID | undefined;

}