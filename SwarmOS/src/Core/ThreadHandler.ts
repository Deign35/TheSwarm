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

    CreateNewThreadGroup(host: PID) {
        this.log.debug(`New thread request ${host}`);
        let tID = 'Thread_' + GetSUID();
        if (!this.memory[tID]) {
            this.memory[tID] = {
                hostProcess: host
            }
            this.log.debug(`New thread created for ${host} [${tID}]`);
            return tID;
        }
        return undefined
    }

    CloseThreadGroup(tID: ThreadID) {
        if (this.memory[tID]) {
            delete this.memory[tID];
        }
    }
}

export abstract class HostedThreadProcess<T extends HostThread_Memory> extends BasicProcess<T> {
    protected executeProcess(): void {
        /*let self = this;
        this.scheduler.SubmitWork(this.memory.sID, function* () {
            yield* self.ScheduledProcessLogic();
        }());*/
    }

    ActivateThread(): IterableIterator<number> {
        let childIter = this.MakeChildThreadIterator();
        return (function* () { yield* childIter })();
    }

    protected MakeChildThreadIterator(): IterableIterator<number> {
        let pids = Object.keys(this.memory);
        let curChildState = {};
        for (let i = 0; i < pids.length; i++) {
            let child = this.kernel.getProcessByPID(pids[i]) as ChildThreadProcess<HostThread_Memory>;
            if (!child) {
                delete this.memory[pids[i]];
                continue;
            }
            curChildState[pids[i]] = {
                pri: this.memory.childThreads[pids[i]].priority,
                proc: child
            }

        }

        pids = Object.keys(this.memory);
        return (function* () {
            for (let i = 0; i < pids.length; i++) {
                let child = curChildState[pids[i]];

                if (!child.GetThread) {
                    throw new Error(`Attempted to active a non threaded process from a host thread`)
                }

                let result: IteratorResult<number>;
                do {
                    result = yield* child.GetThread()
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