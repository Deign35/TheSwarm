declare var Memory: {
    ThreadProcs: { [tid in ThreadID]: IThreadProc_Data };
}

import { BasicProcess, ExtensionBase } from "Core/BasicTypes";

export class ThreadExtensions extends ExtensionBase implements IKernelThreadExtensions {
    constructor(extReg: IExtensionRegistry) {
        super(extReg);
    }
    private get memory() {
        if (!Memory.ThreadProcs) {
            this.log.warn(`Initializing ThreadExtensions memory`);
            Memory.ThreadProcs = {};
        }
        return Memory.ThreadProcs;
    }

    EnsureThreadGroup(host: PID, tid?: ThreadID) {
        this.log.debug(`New thread request ${host}`);
        if (!tid || !this.memory[tid]) {
            if (!tid) {
                tid = 'TH_' + GetSUID();
            }
            this.memory[tid] = {
                hostProcess: host
            }
            this.log.debug(`New thread created for ${host} [${tid}]`);
        }
        return tid
    }

    CloseThreadGroup(tID: ThreadID) {
        if (this.memory[tID]) {
            delete this.memory[tID];
        }
    }
}

declare interface ChildThreadState {
    pri: Priority;
    childThread: IterableIterator<number>;
}

export abstract class HostedThreadProcess<T extends HostThread_Memory> extends BasicProcess<T> {
    @extensionInterface(EXT_ThreadHandler)
    protected thread!: IKernelThreadExtensions;
    protected get threadID() { return this.memory.tid; }
    protected executeProcess(): void {
        this.thread.EnsureThreadGroup(this.pid, this.threadID);

    }

    ActivateThread(): IterableIterator<number> {
        let childIter = this.MakeChildThreadIterator();
        return (function* () { yield* childIter })();
    }

    protected MakeChildThreadIterator(): IterableIterator<number> {
        let pids = Object.keys(this.memory);
        let activePIDS = [];
        let curChildState: IDictionary<PID, ChildThreadState> = {};
        for (let i = 0; i < pids.length; i++) {
            let child = this.kernel.getProcessByPID(pids[i]) as ChildThreadProcess<HostThread_Memory>;
            if (!child) {
                delete this.memory[pids[i]];
                continue;
            }
            if (!child.GetThread) {
                throw new Error(`Attempted to active a non threaded process from a host thread`)
            }

            curChildState[pids[i]] = {
                pri: this.memory.childThreads[pids[i]].priority,
                childThread: child.GetThread()
            }
            activePIDS.push(pids[i]);
        }

        return (function* () {
            for (let i = 0; i < activePIDS.length; i++) {
                let child = curChildState[activePIDS[i]];
                let result: IteratorResult<number>;
                do {
                    result = child.childThread.next();
                    yield result.value;
                } while (result && !result.done);
            }
        })();
    }
}

export abstract class ChildThreadProcess<T extends HostThread_Memory> extends BasicProcess<T> {
    protected executeProcess(): void {
        // Prep data for the thread activation
    }

    abstract GetThread(): IterableIterator<number>
}