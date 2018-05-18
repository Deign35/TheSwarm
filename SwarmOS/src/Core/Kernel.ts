import { Logger } from "Core/Logger";

declare var Memory: {
    kernel: KernelMemory
}

declare type ProcessCache = {
    [id in PID]: {
        context: IProcessContext,
        process: IProcess
    }
}

export class Kernel implements IKernel, IKernelProcessExtensions, IKernelSleepExtension {
    constructor(private processRegistry: IProcessRegistry, private extensionRegistry: IExtensionRegistry,
        private _logger: IKernelLoggerExtensions) {
        this._processCache = {};
    }
    private _processCache: ProcessCache;
    private curProcessID: string = "";
    get log() {
        return this._logger;
    }

    get memory(): KernelMemory {
        Memory.kernel = Memory.kernel || {
            processTable: {},
            processMemory: {},
            subscriptions: {},
            notifications: [],
            ThreadProcs: {}
        };
        return Memory.kernel;
    }
    get processTable(): ProcessTable {
        return this.memory.processTable;
    }
    get processMemory(): ProcessMemory {
        return this.memory.processMemory;
    }
    get processThreads() {
        return this.memory.ThreadProcs;
    }

    installBundle(bundle: IPackage<{}>) {
        bundle.install(this.processRegistry, this.extensionRegistry);
    }
    installPackages(bundles: IPackage<{}>[]) {
        for (let id in bundles) {
            this.installBundle(bundles[id]);
        }
    }

    startProcess(packageName: OSPackage, startMemory: MemBase): PID {
        let pid = 'p' + GetSUID() as PID;
        let pInfo: ProcInfo = {
            pid: pid,
            pP: this.curProcessID,
            PKG: packageName,
            ex: true,
            st: Game.time,
        };

        this.processTable[pid] = pInfo;
        this.processMemory[pid] = startMemory || {};

        let process = this.createProcess(pid);
        this.log.debug(`CreateNewProcess: ${packageName}`);
        return pid;
    }

    createProcess(id: PID): IProcess {
        this.log.debug(`ConstructProcess ${id}`);
        let pInfo = this.processTable[id];
        if (!pInfo) {
            throw new Error(`Process ${id} does not exist`)
        }

        let kernelContext = this;
        // (TODO): Reevaluate and ensure start context is correct
        let context: IProcessContext = {
            pid: pInfo.pid,
            pkgName: pInfo.PKG,
            get isActive() {
                return kernelContext.processTable[id] && kernelContext.processTable[id].ex;
            },
            get pPID() {
                return kernelContext.processTable[id] && kernelContext.processTable[id].pP || "";
            },
            get memory() {
                return kernelContext.processMemory[pInfo.pid];
            },
            // bind getExtension to getPackageInterface.
            getPackageInterface: kernelContext.extensionRegistry.get.bind(kernelContext.extensionRegistry)
        };
        Object.freeze(context);
        let process = this.processRegistry.createNewProcess(pInfo.PKG, context);
        if (!process) throw new Error(`Could not create process ${pInfo.pid} ${pInfo.PKG}`);
        this._processCache[id] = { context, process, };
        return process;
    }

    // killProcess also kills all children of this process
    // note to the wise: probably absorb any calls to this that would wipe out your entire process tree.
    killProcess(id: PID): void {
        let pinfo = this.processTable[id];
        if (!pinfo) return;
        this.log.warn(`killed ${id}`);
        pinfo.ex = false;
        pinfo.end = Game.time;
        if (pinfo.pP == '') return
        let ids = Object.keys(this.processTable);
        for (let i = 0; i < ids.length; i++) {
            let id = ids[i];
            let pi = this.processTable[id]
            if (pi.pP === pinfo.pid) {
                if (pi.ex) {
                    this.killProcess(id);
                }
            }
        }
    }

    getProcessByPID(pid: PID): IProcess | undefined {
        if (!this.processTable[pid]) {
            return;
        }
        if (this._processCache[pid]) {
            return this._processCache[pid].process;
        } else {
            return this.createProcess(pid);
        }
    }

    setParent(pid: PID, parentPId?: PID): boolean {
        if (!this.processTable[pid]) return false;
        this.processTable[pid].pP = parentPId;
        return true;
    }

    loop() {
        let processIDs = Object.keys(this.processTable);

        let hasActiveProcesses = false;
        for (let i = 0; i < processIDs.length; i++) {
            let pid = processIDs[i];
            let pInfo = this.processTable[pid];
            if (!pInfo.ex) {
                delete this.processTable[pid];
                delete this.processMemory[pid];
                delete this._processCache[pid];
                if (this.processThreads[pid]) {
                    delete this.processThreads[pid];
                }
                continue;
            }
            hasActiveProcesses = true;
            try {
                let proc = this.getProcessByPID(pid);
                if (!proc) throw new Error(`Could not get process ${pid} ${pInfo.PKG}`);
                this.curProcessID = pid;

                if (this.processTable[pid].sl) {
                    if ((this.processTable[pid].sl! <= Game.time)) {
                        this.wake(this.curProcessID);
                    }
                }
                if (!this.processTable[pid].sl) {
                    proc.run();
                }

                this.curProcessID = "";
            } catch (e) {
                this.killProcess(pid);
                pInfo.err = e.stack || e.toString();
                this.log.error(`[${pid}] ${pInfo.PKG} crashed\n${e.stack}`);
            }
        }
        let threadIDs = Object.keys(this.processThreads);
        for (let i = 0; i < threadIDs.length; i++) {
            let pid = this.processThreads[threadIDs[i]].hostProcess;
            let pInfo = this.processTable[pid];
            if (!pInfo.ex) {
                continue;
            }
            try {
                let proc = this.getProcessByPID(pid) as IThreadProcess
                if (!proc) throw new Error(`Could not get process ${pid} ${pInfo.PKG}`);
                this.curProcessID = pid;

                let procIter = proc.GetThread();
                while (!procIter.next().done) { }
                // Need to do something about sleeping threads here!

                this.curProcessID = "";
            } catch (e) {
                this.killProcess(pid);
                pInfo.err = e.stack || e.toString();
                this.log.error(`[${pid}] ${pInfo.PKG} crashed\n${e.stack}`);
            }
        }
        if (!hasActiveProcesses)
            this.startProcess(PKG_SwarmManager, {});
    }

    sleep(ticks: number): void {
        let pInfo = this.processTable[this.curProcessID];
        pInfo.sl = Game.time + ticks;
    }
    wake(pid: PID): void {
        if (this.processTable[pid] && this.processTable[pid].sl) {
            delete this.processTable[pid].sl;
            // (TODO): Don't let newly awoken processes run this tick.
        }
    }

    EnsureThreadGroup(host: PID, tid?: ThreadID) {
        this.log.debug(`New thread request ${host}`);
        if (!tid || !this.processThreads[tid]) {
            if (!tid) {
                tid = 'TH_' + GetSUID();
            }
            this.processThreads[tid] = {
                hostProcess: host
            }
            this.log.debug(`New thread created for ${host} [${tid}]`);
        }
        return tid
    }

    CloseThreadGroup(tID: ThreadID) {
        if (this.processThreads[tID]) {
            delete this.processThreads[tID];
        }
    }
}