import { BasicProcess } from "Core/BasicTypes";

export abstract class SoloJob<T extends SoloJob_Memory> extends BasicProcess<T> {
    @extensionInterface(EXT_CreepRegistry)
    creepRegistry!: ICreepRegistryExtensions;
    @extensionInterface(EXT_CreepActivity)
    protected creepActivity!: ICreepActivityExtensions;

    protected get homeRoom(): Room {
        return Game.rooms[this.memory.rID];
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
        let sID = this.GetNewSpawnID();
        let spawnMem: SpawnActivity_Memory = {
            sID: sID,
            HC: 'CreateCreepActivity'
        }
        this.memory.a = this.kernel.startProcess(SPKG_SpawnActivity, spawnMem)
        this.kernel.setParent(this.memory.a, this.pid);
    }
    protected abstract GetNewSpawnID(): string;

    CreateCreepActivity(creepID: CreepID) {
        this.creepRegistry.tryReserveCreep(creepID, this.pid);
        this.creep = this.creepRegistry.tryGetCreep(creepID, this.pid);
        this.memory.c = creepID;
        if (!this.creep) {
            if (this.memory.exp) {
                this.EndProcess();
            }
            return;
        }
        this.memory.a = this.CreateCustomCreepActivity(this.creep);
        if (!this.memory.a) {
            this.HandleNoActivity();
        } else {
            this.kernel.setParent(this.memory.a, this.pid);
            let childActivity = this.kernel.getProcessByPID(this.memory.a)!;
            if (!childActivity.memory.HC) {
                childActivity.memory.HC = 'CreateCreepActivity';
            }
        }
    }
    protected abstract CreateCustomCreepActivity(creep: Creep): PID | undefined;
    protected HandleNoActivity() {
        this.EndProcess();
    }

    EndProcess() {
        super.EndProcess(this.memory.c);
    }
}