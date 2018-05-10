import { ProcessBase } from "Core/BasicTypes";

export abstract class CreepBase<T extends CreepProcess_Memory> extends ProcessBase {
    OnLoad() {
        // Clean up any existing spawn requests
        if (this.memory.creep) {
            let creepStatus = this.spawner.getStatus(this.memory.creep);
            if (creepStatus.status == EPosisSpawnStatus.ERROR || creepStatus.status == EPosisSpawnStatus.SPAWNED) {
                this.spawner.cancelCreep(this.memory.creep);
                if (!Game.creeps[this.memory.creep]) {
                    delete this.memory.creep;
                }
            }
        }
    }
    protected GetNewCreepName() {
        return GetSUID();
    }
    protected get memory(): T {
        return super.memory;
    }
    protected executeProcess(): void {
        if (this.memory.creep && Game.creeps[this.memory.creep]) {
            this.activateCreep();
        } else {
            if (this.memory.creep) {
                let spawnStatus = this.spawner.getStatus(this.memory.creep);
                if (!spawnStatus) {
                    this.memory.creep = undefined;
                } else {
                    if (spawnStatus.status != EPosisSpawnStatus.QUEUED) {
                        if (spawnStatus.status != EPosisSpawnStatus.SPAWNING) {
                            this.spawner.cancelCreep(this.memory.creep);
                            this.memory.creep = undefined;
                        }
                    }
                }
            }
            if (!this.memory.creep) {
                this.memory.creep = this.spawner.spawnCreep({
                    body: {
                        body: [WORK, WORK, CARRY, MOVE],
                        cost: 300
                    },
                    creepName: this.GetNewCreepName(),
                    location: '',
                    spawnState: EPosisSpawnStatus.QUEUED,
                    priority: Priority.Medium,
                    pid: this.pid
                });
            }
        }
    }
    protected abstract activateCreep(): void;
}