
declare interface ISchedulerMemory extends SDictionary<any> {
    registeredLogs: { [id: string]: ISchedulerMemory_LogData };
}

declare interface ISchedulerMemory_LogData {
    entries: { [id: string]: ISchedulerMemory_EntryData };
}
declare interface ISchedulerMemory_EntryData {

}
declare var Memory: {
    SchedulerData: ISchedulerMemory
}

import { BasicProcess, ExtensionBase } from "Core/BasicTypes";

export const bundle: IPackage<ISchedulerMemory> = {
    install(processRegistry: IProcessRegistry, extensionRegistry: IExtensionRegistry) {
        extensionRegistry.register(EXT_Scheduler, SchedulerExtension);
    }
}

class SchedulerExtension extends ExtensionBase implements SchedulerExtension {
    protected constructor(extReg: IExtensionRegistry) {
        super(extReg);
    }
    private get memory() {
        return Memory.SchedulerData;
    }
    ScheduleLogic(sID: ScheduleID, logic: Iterable<number>): void {
        if (!this.memory[sID]) {
            this.CreateNewScheduleLog(sID);
        }




    }

    private CreateNewScheduleLog(sID: ScheduleID) {
        this.memory.registeredLogs[sID] = {
            entries: {}
        };
    }
}

export abstract class ScheduledProcess<T extends ScheduledProcessMemBase> extends BasicProcess<T> {
    @extensionInterface(EXT_Scheduler)
    protected scheduler!: ISchedulerExtension;
    protected executeProcess(): void {
        let self = this;
        this.scheduler.ScheduleLogic(this.memory.sID, function* () {
            yield* self.ScheduledProcessLogic();
        }());
    }

    protected abstract ScheduledProcessLogic(): Iterable<number>;
}