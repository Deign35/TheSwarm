import { BasicProcess, ThreadProcess } from "Core/BasicTypes";
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

    protected executeProcess() {
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
    }
}
declare interface ChildThreadState {
    childThread: ThreadProcess<ThreadMemory>;
    pri: Priority;
    sta: ThreadState;
}

export abstract class ParentThreadProcess<T extends ThreadMemory_Parent> extends ThreadProcess<T>  {
    protected get childThreadPrefix() { return 'T'; }
    protected get children() { return this.memory.childThreads; }

    protected get ActiveThreads() {
        return this._activeThreads;
    }
    private _activeThreads!: IDictionary<ThreadID, ChildThreadState>;

    protected executeProcess(): void {
        super.executeProcess();
        this.PrepareChildren();
        let threadIDs = Object.keys(this.children);
        let activePIDS = [];
        this._activeThreads = {};
        for (let i = 0; i < threadIDs.length; i++) {
            let child = this.kernel.getProcessByPID(this.children[threadIDs[i]].pid) as ThreadProcess<ThreadMemory>;
            if (!child) {
                this.CloseChildThread(threadIDs[i]);
                continue;
            }
            if (!child.RunThread) {
                // Child is not a threaded process, skip it.
                continue;
            }

            this._activeThreads[threadIDs[i]] = {
                pri: this.children[threadIDs[i]].priority,
                sta: ThreadState_Active as ThreadState,
                childThread: child
            }
        }
    }

    protected abstract PrepareChildren(): void;

    GetChildThread(tid: ThreadID) {
        return this.children[tid];
    }

    RunThread(): ThreadState {
        let activeThreadIDs = Object.keys(this._activeThreads);
        let curThread;
        if (activeThreadIDs.length > 0) {
            curThread = this._activeThreads[activeThreadIDs[0]];
        }

        if (!curThread) {
            return ThreadState_Done;
        }

        curThread.sta = curThread.childThread.RunThread();
        switch (curThread.sta) {
            case (ThreadState_Inactive):
            case (ThreadState_Done):
            case (ThreadState_Overrun): // (TODO): Turn Overrun into a thread state that allows the thread to do extra work as cpu is available.
                delete this._activeThreads[activeThreadIDs[0]];
            case (ThreadState_Active): return ThreadState_Active;
            default:
                delete this._activeThreads[activeThreadIDs[0]];
                break;
        }
        return ThreadState_Active;
    }

    AttachChildThread(startContext: ThreadMemory, parentPID?: PID, pid?: PID): ThreadID {
        let newThreadID = this.childThreadPrefix + GetSUID();
        let childProc = undefined;
        if (pid) {
            childProc = this.kernel.getProcessByPID(pid);
        }

        if (!childProc) {
            pid = this.kernel.startProcess(startContext.PKG, startContext);
        }
        this.children[newThreadID] = {
            pid: pid!,
            priority: Priority_Medium,
            tid: newThreadID
        };
        this.kernel.setParent(pid!, parentPID);
        return newThreadID;
    }

    CloseChildThread(tid: ThreadID) {
        this.kernel.killProcess(this.children[tid].pid);
        delete this.children[tid];
    }
}