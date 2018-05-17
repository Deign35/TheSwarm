declare interface ISchedulerData_Memory extends SDictionary<any> { }

declare var Memory: {
    SchedulerData: ISchedulerData_Memory
}

import { BasicProcess, ExtensionBase } from "Core/BasicTypes";

export const bundle: IPackage<ISchedulerData_Memory> = {
    install(processRegistry: IProcessRegistry, extensionRegistry: IExtensionRegistry) {
        extensionRegistry.register(EXT_Scheduler, SchedulerExtension);
    }
}

class SchedulerExtension extends ExtensionBase {

}
