declare var Memory: {
    kernel: KernelMemory
}

declare type ProcessCache = {
    [id in PID]: {
        context: IProcessContext;
        process: IProcess;
    }
}

const TS_Active = 1;
const TS_Waiting = 2;
const TS_Done = 3;

declare type TS_Active = 1;
declare type TS_Waiting = 2;
declare type TS_Done = 3;
declare type TickState = TS_Active | TS_Waiting | TS_Done;

export class Kernel implements IKernel, IKernelExtensions, IKernelSleepExtension {
    constructor(private processRegistry: IProcessRegistry, private extensionRegistry: IExtensionRegistry,
        private _logger: IKernelLoggerExtensions) {
        this._processCache = {};
    }
    private _processCache: IDictionary<PID, IProcess>;
    private _curTickState!: IDictionary<PID, TickState>;

    get log() {
        return this._logger;
    }
    get memory(): KernelMemory {
        if (!Memory.kernel) {
            Memory.kernel = {
                processTable: {},
                processMemory: {},
                ErrorLog: []
            };
        }
        return Memory.kernel;
    }
    get processTable(): ProcessTable {
        return this.memory.processTable;
    }
    get processMemory(): ProcessMemory {
        return this.memory.processMemory;
    }

    installPackage(pack: IPackage<{}>) {
        pack.install(this.processRegistry, this.extensionRegistry);
    }
    installPackages(pack: IPackage<{}>[]) {
        for (let id in pack) {
            this.installPackage(pack[id]);
        }
    }

    startProcess(packageName: ScreepsPackage, startMemory: MemBase): PID {
        let pid = 'p' + GetSUID() as PID;
        let pInfo: ProcInfo = {
            pid: pid,
            PKG: packageName
        };

        this.processTable[pid] = pInfo;
        this.processMemory[pid] = startMemory || {};

        this.PrepTick(pid);
        return pid;
    }

    createProcess(id: PID): IProcess {
        this.log.debug(`ConstructProcess ${id}`);
        let pInfo = this.processTable[id];
        if (!pInfo) {
            throw new Error(`Process ${id} does not exist`);
        }

        let kernelContext = this;
        let context: IProcessContext = {
            pid: pInfo.pid,
            pkgName: pInfo.PKG,
            rngSeed: GetRandomIndex(primes_3000),
            get isActive() {
                return kernelContext.processTable[id] && !kernelContext.processTable[id].end;
            },
            get pPID() {
                return kernelContext.processTable[id] && kernelContext.processTable[id].pP || "";
            },
            get memory() {
                return kernelContext.processMemory[pInfo.pid];
            },
            getPackageInterface: kernelContext.extensionRegistry.get.bind(kernelContext.extensionRegistry)
        };
        Object.freeze(context);
        let process = this.processRegistry.createNewProcess(pInfo.PKG, context);
        if (!process) {
            throw new Error(`Could not create process ${pInfo.pid} ${pInfo.PKG}`);
        }
        this._processCache[id] = process;
        return process;
    }

    killProcess(id: PID, msg: string = ''): void {
        let pinfo = this.processTable[id];
        if (!pinfo) return;
        if (msg) {
            this.log.info(`${id} killed - ${msg}`);
        }
        pinfo.end = Game.time;
        let ids = Object.keys(this.processTable);
        for (let i = 0; i < ids.length; i++) {
            let id = ids[i];
            let pi = this.processTable[id]
            if (pi.pP === pinfo.pid) {
                if (!pi.end) {
                    this.killProcess(id, msg);
                }
            }
        }
    }

    getProcessByPID(pid: PID): IProcess | undefined {
        if (!this.processTable[pid] || this.processTable[pid].end) {
            return;
        }

        if (!this._processCache[pid]) {
            this.createProcess(pid);
        }
        return this._processCache[pid];
    }

    // (TODO): Update startprocess to take a parentpid as a parameter
    setParent(pid: PID, parentPID?: PID): boolean {
        if (!this.processTable[pid]) {
            return false;
        }
        this.processTable[pid].pP = parentPID;
        return true;
    }

    loop() {
        this._curTickState = {};
        let processIDs = Object.keys(this.processTable);
        for (let i = 0; i < processIDs.length; i++) {
            let pInfo = this.processTable[processIDs[i]];
            if (pInfo.sl) {
                if (pInfo.sl! <= Game.time) {
                    this.wake(pInfo.pid);
                }
            }
            if (!pInfo.sl) {
                this.PrepTick(processIDs[i]);
            }
        }

        let activeThreadIDs = Object.keys(this._curTickState);
        if (activeThreadIDs.length == 0) {
            let SwarmManagerMemory: PackageProviderMemory = {
                services: {}
            }
            this.startProcess(PKG_SwarmManager, SwarmManagerMemory);
            // Initialization doesn't work on the first tick for some reason.  So skip the first tick.
            return;
        }

        while (activeThreadIDs.length > 0) {
            let protectionValue = activeThreadIDs.length;
            this.RunThreads(activeThreadIDs);
            let allIDs = Object.keys(this._curTickState);
            for (let i = 0; i < allIDs.length; i++) {
                let state = this._curTickState[allIDs[i]]
                if (state == TS_Waiting || state == TS_Active) {
                    activeThreadIDs.push(allIDs[i]);
                    this._curTickState[allIDs[i]] = TS_Active;
                }
            }

            if (protectionValue == activeThreadIDs.length) {
                // (TODO): Find out how to fix this, essentially this means threading isn't working.
                //this.log.alert(`A full cycle has occurred and no threads completed`);
                break;
            }
        }

        processIDs = Object.keys(this.processTable);
        for (let i = 0; i < processIDs.length; i++) {
            this.EndTick(processIDs[i]);
        }
    }

    private RunThreads(ids: PID[]) {
        while (ids.length > 0) {
            let pid = ids.shift()!;
            let pInfo = this.processTable[pid];
            try {
                let process = this.getProcessByPID(pid);
                if (!process) {
                    this._curTickState[pid] = TS_Done;
                    continue;
                }
                let result = process.RunThread();
                switch (result) {
                    case (ThreadState_Active):
                        ids.push(pid);
                        break;
                    case (ThreadState_Waiting):
                        this._curTickState[pid] = TS_Waiting;
                        break;
                    case (ThreadState_Inactive):
                    case (ThreadState_Overrun):
                    case (ThreadState_Done):
                        this._curTickState[pid] = TS_Done;
                    default:
                        break;
                }
            } catch (e) {
                let pInfo = this.processTable[pid];
                this.killProcess(pid, `Kernel.loop()`);
                pInfo.err = e.stack || e.toString();
                this.log.error(`[${pid}] ${pInfo.PKG} crashed\n${e.stack}`);
            }
        }
    }

    private PrepTick(pid: PID) {
        if (this._curTickState[pid]) {
            return;
        }
        let pInfo = this.processTable[pid];
        try {
            let proc = this.getProcessByPID(pid)!;
            if (proc.PrepTick) {
                proc.PrepTick();
            }
            this._curTickState[pid] = TS_Active;
        } catch (e) {
            this.killProcess(pid, `Kernel.PrepTick()`);
            pInfo.err = e.stack || e.toString();
            this.log.error(`[${pid}] ${pInfo.PKG} crashed\n${e.stack}`);
        }
    }

    private EndTick(pid: PID) {
        let pInfo = this.processTable[pid];
        if (this._curTickState[pid]) {
            let proc = this.getProcessByPID(pid);
            if (proc && proc.EndTick) {
                try {
                    proc.EndTick();
                } catch (e) {
                    this.killProcess(pid, `Kernel.EndTick()`);
                    pInfo.err = e.stack || e.toString();
                    this.log.error(`[${pid}] ${pInfo.PKG} crashed\n${e.stack}`);
                }
            }
        }

        if (pInfo.end) {
            if (pInfo.err) {
                this.memory.ErrorLog.push(`[${pid}] - ${pInfo.err}`);
            }
            delete this.processTable[pid];
            delete this.processMemory[pid];
            delete this._processCache[pid];
            return;
        }
    }

    sleep(pid: PID, ticks: number): void {
        let pInfo = this.processTable[pid];
        pInfo.sl = Game.time + ticks;
    }

    wake(pid: PID): void {
        if (this.processTable[pid] && this.processTable[pid].sl) {
            delete this.processTable[pid].sl;
            this.PrepTick(pid);
            this._curTickState[pid] = TS_Waiting;
        }
    }
}