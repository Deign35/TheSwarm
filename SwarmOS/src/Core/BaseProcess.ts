import { posisInterface } from "Core/ExtensionRegistry"

export abstract class BaseProcess implements IPosisProcess {
    constructor(protected context: IPosisProcessContext) {

    }
    @posisInterface("kernel")
    protected kernel!: IPosisKernel
    protected get memory(): any {
        return this.context.memory;
    }
    get imageName(): string { // image name (maps to constructor)
        return this.context.imageName;
    }
    get pid(): PID { // ID
        return this.context.pid;
    }
    get parentPID(): PID { // Parent ID
        return this.context.pPID;
    }
    get state() {
        return this.context.state;
    }
    SetProcessToSleep(ticks: number) {
        let sleeper = this.context.queryPosisInterface("sleep");
        sleeper.sleep(ticks);
    }

    abstract run(): void;
}