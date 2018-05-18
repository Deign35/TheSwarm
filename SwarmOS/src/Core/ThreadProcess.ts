declare var Memory: {
    ThreadProcs: { [tid in ThreadID]: IThreadProc_Data };
}

import { BasicProcess } from "Core/BasicTypes";

declare interface ChildThreadState {
    pri: Priority;
    childThread: IterableIterator<number>;
}


export abstract class ThreadProcess<T extends ThreadMemory> extends BasicProcess<T> implements IThreadProcess {
    @extensionInterface(EXT_ThreadHandler)
    protected thread!: IKernelThreadExtensions;

    protected executeProcess(): void {
        // Prep data for the thread activation
    }

    abstract GetThread(): IterableIterator<number>
}

export abstract class HostedThreadProcess<T extends HostThread_Memory> extends ThreadProcess<T>  {
    protected get threadID() { return this.memory.tid; }
    protected executeProcess(): void {
        this.thread.EnsureThreadGroup(this.pid, this.threadID);

    }

    GetThread(): IterableIterator<number> {
        let childIter = this.MakeChildThreadIterator();
        return (function* () { yield* childIter })();
    }

    protected MakeChildThreadIterator(): IterableIterator<number> {
        let threadIDs = Object.keys(this.memory.childThreads);
        let activePIDS = [];
        let curChildState: IDictionary<PID, ChildThreadState> = {};
        for (let i = 0; i < threadIDs.length; i++) {
            let child = this.kernel.getProcessByPID(this.memory.childThreads[threadIDs[i]].pid) as ThreadProcess<ThreadMemory>;
            if (!child) {
                delete this.memory[threadIDs[i]];
                continue;
            }
            if (!child.GetThread) {
                throw new Error(`Attempted to active a non threaded process from a host thread`)
            }

            curChildState[threadIDs[i]] = {
                pri: this.memory.childThreads[threadIDs[i]].priority,
                childThread: child.GetThread()
            }
            activePIDS.push(threadIDs[i]);
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