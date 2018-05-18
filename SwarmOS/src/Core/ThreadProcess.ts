declare var Memory: {
    ThreadProcs: { [tid in ThreadID]: IThreadProc_Data };
}

import { BasicProcess } from "Core/BasicTypes";

declare interface ChildThreadState {
    childThread: ThreadProcess<ThreadMemory>;
    pri: Priority;
    sta: ThreadState;
}


export abstract class ThreadProcess<T extends ThreadMemory> extends BasicProcess<T> implements IThreadProcess {
    @extensionInterface(EXT_ThreadHandler)
    protected thread!: IKernelThreadExtensions;
    get ThreadID() { return this.memory.registeredThreadID; }

    protected executeProcess(): void { }
    abstract RunThread(): ThreadState;

    OnProcessInstantiation() {
        this.RegisterThread();
    }

    RegisterThread() {
        if (this.ThreadID) {
            this.thread.EnsureThreadGroup(this.pid, this.ThreadID);
        }
    }
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
        let threadIDs = Object.keys(this.memory.childThreads);
        let activePIDS = [];
        this._activeThreads = {};
        for (let i = 0; i < threadIDs.length; i++) {
            let child = this.kernel.getProcessByPID(this.children[threadIDs[i]].pid) as ThreadProcess<ThreadMemory>;
            if (!child) {
                delete this.memory[threadIDs[i]];
                continue;
            }
            if (!child.RunThread) {
                // Child is not a threaded process, skip it
                continue;
            }

            this._activeThreads[threadIDs[i]] = {
                pri: this.children[threadIDs[i]].priority,
                sta: ThreadState_Active as ThreadState,
                childThread: child
            }
        }
    }
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
                activeThreadIDs.shift();
            case (ThreadState_Active): return ThreadState_Active;
            default:
                activeThreadIDs.shift();
                break;
        }
        return ThreadState_Active;
    }

    protected CreateChildThread(packageID: PackageType, startContext: MemBase) {
        let newThreadID = this.childThreadPrefix + GetSUID();
        let newProc = this.kernel.startProcess(packageID, startContext);
        this.children[newThreadID] = {
            pid: newProc,
            priority: Priority_Medium,
            tid: newThreadID
        };
        this.kernel.setParent(newProc, this.pid);
    }
}