import { posisInterface } from "Core/ExtensionRegistry"

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
    baseTest: {
        processName: "SwarmBase/PosisBaseTestProcess",
        startContext: {
            maxRunTime: 25
        }
    }
};

class ServiceProvider implements IPosisProcess {
    constructor(private context: IPosisProcessContext) {
        if (!this.context.memory.services) {
            this.context.memory.services = {};
        }
        //this.addService("sleeperTest", "ags131/SleeperTest", {}, true)
        //this.addService("baseTest", "SwarmBase/PosisBaseTestProcess", { maxRunTime: 25 })
    }
    get id() {
        return this.context.pid
    }
    get memory(): ServiceProviderMemory {
        return this.context.memory
    }

    @posisInterface("kernel")
    private kernel!: IPosisKernel

    addService(serviceID: string, id: string, startContext: any = {}) {
        Logger.info(`Adding service ${id}`);
        let result = this.kernel.startProcess(id, Object.assign({}, startContext));
        if (result) {
            this.kernel.setParent(result.pid);
            this.memory.services[serviceID] = { pid: result.pid, serviceID };
            this.kernel.setParent(result.pid);
        }
    }

    run() {
        let ids = Object.keys(REQUIRED_PROCESSES)
        for (let i = 0, length = ids.length; i < length; i++) {
            let service = this.memory.services[ids[i]];
            let process = (service && service.pid) ? this.kernel.getProcessById(service.pid) : undefined;

            if (!service || !process) {
                Logger.info(`Initializing service ${ids[i]}`);

                let initData = REQUIRED_PROCESSES[ids[i]];
                this.addService(ids[i], initData.processName, initData.startContext);
                service = this.memory.services[ids[i]];
                process = (service && service.pid) ? this.kernel.getProcessById(service.pid) : undefined;

                if (!service || !process) {
                    Logger.error(`Failed to restart service ${ids[i]}`);
                    continue;
                }
            }
        }
    }
}

export const bundle: IPosisBundle<{}> = {
    install(registry: IPosisProcessRegistry) {
        registry.register("ServiceProvider", ServiceProvider)
    }
}
