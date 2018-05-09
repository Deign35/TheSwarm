import { BaseProcess } from "Core/ProcessRegistry";
import { IN_RoomManager } from "SwarmManagers/RoomManager";
import { IN_SpawnManager } from "SwarmManagers/SpawnManager";

declare type ServiceProviderMemory = {
    services: {
        [id: string]: {
            pid: PID,
            serviceID: string
        }
    }
}

declare type ProcDetails = {
    processName: string,
    startContext?: any
}

const REQUIRED_PROCESSES: IDictionary<ProcDetails> = {
    roomManager: {
        processName: IN_RoomManager
    },
    spawnManager: {
        processName: IN_SpawnManager
    }
};

const SCAN_FREQUENCY = 5;
class ServiceProvider extends BaseProcess {
    constructor(protected context: IPosisProcessContext) {
        super(context);
        if (!this.context.memory.services) {
            this.context.memory.services = {};
        }
    }
    get log() {
        return Logger;
    }

    addService(serviceID: string, id: string, startContext: any = {}) {
        this.log.info(`Adding service ${id}`);
        let result = this.kernel.startProcess(id, Object.assign({}, startContext));
        if (result) {
            this.kernel.setParent(result.pid);
            this.memory.services[serviceID] = { pid: result.pid, serviceID };
            this.kernel.setParent(result.pid);
        }
    }

    protected executeProcess() {
        let ids = Object.keys(REQUIRED_PROCESSES)
        for (let i = 0, length = ids.length; i < length; i++) {
            let service = this.memory.services[ids[i]];
            let process = (service && service.pid) ? this.kernel.getProcessById(service.pid) : undefined;

            if (!service || !process || process.state == ProcessState.Killed) {
                this.log.info(`Initializing service ${ids[i]}`);

                let initData = REQUIRED_PROCESSES[ids[i]];
                this.addService(ids[i], initData.processName, initData.startContext);
                service = this.memory.services[ids[i]];
                process = (service && service.pid) ? this.kernel.getProcessById(service.pid) : undefined;

                if (!service || !process) {
                    this.log.error(`Failed to restart service ${ids[i]}`);
                    continue;
                }
            }
        }

        // this.SetProcessToSleep(SCAN_FREQUENCY); (TODO) Implement sleep
    }
}

export const IN_ServiceProvider = 'ServiceProvider';
export const bundle: IPosisBundle<{}> = {
    install(processRegistry: IPosisProcessRegistry, extensionRegistry: IPosisExtensionRegistry) {
        processRegistry.register(IN_ServiceProvider, ServiceProvider)
    }
}
