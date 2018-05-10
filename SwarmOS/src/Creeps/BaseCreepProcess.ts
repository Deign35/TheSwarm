import { BaseProcess } from "Core/ProcessRegistry";

export abstract class BaseCreepProcess<T extends CreepData_Memory> extends BaseProcess {
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
                    creepName: GetSUID(),
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