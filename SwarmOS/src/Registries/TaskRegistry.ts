declare var Memory: {
    taskData: TaskRegistry_Memory
}
import { BasicProcess, ExtensionBase } from "Core/BasicTypes";

export const OSPackage: IPackage<TaskRegistry_Memory> = {
    install(processRegistry: IProcessRegistry, extensionRegistry: IExtensionRegistry) {
        processRegistry.register(PKG_FlagManager, TaskRegistry);
        extensionRegistry.register(EXT_Flags, TaskRegistryExtensions);
    }
}
const PKG_TaskRegistry_LogContext: LogContext = {
    logID: PKG_FlagManager,
    logLevel: LOG_INFO
}

class TaskRegistry extends BasicProcess<TaskRegistry_Memory> {
    protected get memory(): TaskRegistry_Memory {
        if (!Memory.taskData) {
            this.log.warn(`Initializing TaskRegistry memory`);
            Memory.taskData = {
                tasks: {}
            }
        }
        return Memory.taskData;
    }
    protected get tasks() {
        return this.memory.tasks;
    }
    protected get logID() {
        return PKG_TaskRegistry_LogContext.logID;
    }
    protected get logLevel(): LogLevel {
        return PKG_TaskRegistry_LogContext.logLevel!;
    }

    RunThread(): ThreadState {
        // 

        return ThreadState_Done;
    }
}

class TaskRegistryExtensions extends ExtensionBase {
    protected get memory(): TaskRegistry_Memory {
        if (!Memory.taskData) {
            this.log.warn(`Initializing TaskRegistry memory`);
            Memory.taskData = {
                tasks: {}
            }
        }
        return Memory.taskData;
    }
    protected get tasks() {
        return this.memory.tasks;
    }

    RegisterNewTask(task: TaskAssignment_Memory, idBase: string = 't') {
        let tID = idBase + GetSUID();
        this.tasks[tID] = task;

        return tID;
    }

    GetTaskInfo(tID: string) {
        return this.tasks[tID];
    }

    TryGetTask(loc: RoomID, work: number, carryCap: number) {
        let taskIDs = Object.keys(this.tasks);
        for (let i = 0; i < taskIDs.length; i++) {
            let task = this.tasks[taskIDs[i]];
            switch (task.at) {

            }
        }
    }
}
