import { BasicProcess } from "Core/BasicTypes";
import { ExtensionRegistry } from "Registries/ExtensionRegistry";

const SCAN_FREQUENCY = 15;
export abstract class PackageProviderBase<T extends PackageProviderMemory> extends BasicProcess<T> {
    protected OnProcessInstantiation() {
        if (!this.memory.services) {
            this.memory.services = {};
        }
    }

    protected abstract RequiredServices: SDictionary<ProviderService>;
    get ScanFrequency() { return SCAN_FREQUENCY; }

    addPKGService(serviceID: string, id: string, parentPID?: PID, startContext: any = {}) {
        this.log.info(() => `Adding service ${id}`);
        let pid = this.kernel.startProcess(id, Object.assign({}, startContext));
        this.kernel.setParent(pid, parentPID);
        this.memory.services[serviceID] = { pid: pid, serviceID };
    }

    RunThread(): ThreadState {
        let ids = Object.keys(this.RequiredServices)
        for (let i = 0, length = ids.length; i < length; i++) {
            let service = this.memory.services[ids[i]];
            let process = (service && service.pid) ? this.kernel.getProcessByPID(service.pid) : undefined;

            if (!service || !process) {
                this.log.info(() => `Initializing package service ${ids[i]}`);

                let initData = this.RequiredServices[ids[i]];
                this.addPKGService(ids[i], initData.processName, initData.startContext);
                service = this.memory.services[ids[i]];
                process = (service && service.pid) ? this.kernel.getProcessByPID(service.pid) : undefined;

                if (!service || !process) {
                    this.log.error(() => `Failed to restart package service ${ids[i]}`);
                    this.kernel.killProcess(this.pid);
                    continue;
                }
            }
        }

        this.sleeper.sleep(this.ScanFrequency);
        return ThreadState_Done;
    }
}