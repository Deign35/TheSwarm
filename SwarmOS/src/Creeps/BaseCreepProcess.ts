import { BaseProcess } from "Core/ProcessRegistry";

export abstract class BaseCreepProcess<T extends CreepData_Memory> extends BaseProcess {
    protected get memory(): T {
        return super.memory;
    }
    protected executeProcess(): void {
        if (this.memory.creep && Game.creeps[this.memory.creep]) {
            this.activateCreep();
        }
    }
    protected abstract activateCreep(): void;
}