/*declare interface ISchedulerMemory extends MemBase {
    threadProcs: { [sid in ThreadID]: IThreadProc_Data };
}

declare interface IThreadProc_Data {
    hostProcess: PID;
}

declare interface IScheduler_Entry {
    sID: ThreadID;
    it: Iterator<number>;
}
declare var Memory: {
    SchedulerData: ISchedulerMemory
}

import { BasicProcess, ExtensionBase } from "Core/BasicTypes";

export class ThreadExtensions extends ExtensionBase implements IKernelThreadExtensions {
    constructor(extReg: IExtensionRegistry) {
        super(extReg);
    }
    private get memory() {
        return Memory.SchedulerData;
    }
    private get registeredLogs() {
        return this.memory.threadProcs;
    }
    SubmitWork(sID: ThreadID, logic: Iterable<number>): void {
        if (!this.registeredLogs[sID]) {
            throw new Error(`ScheduleID not instantiated`);
        }
    }

    private CreateNewThreadGroup(sID: ThreadID, host: PID) {
        if (!this.registeredLogs[sID]) {
            this.registeredLogs[sID] = {
                hostProcess: host
            }
        }
    }
}

export abstract class ScheduledProcess<T extends ScheduledProcessMemBase> extends BasicProcess<T> {
    @extensionInterface(EXT_Scheduler)
    protected scheduler!: IKernelThreadExtensions;
    protected executeProcess(): void {
        let self = this;
        this.scheduler.SubmitWork(this.memory.sID, function* () {
            yield* self.ScheduledProcessLogic();
        }());
    }

    protected abstract ScheduledProcessLogic(): Iterable<number>;
}*/