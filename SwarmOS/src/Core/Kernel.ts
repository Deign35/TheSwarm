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
    private _curTickIDs!: PID[];
    private _curThreadData!: any;
    private curProcessID: string = "";
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
            pP: this.curProcessID,
            PKG: packageName,
            ex: true,
            st: Game.time
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

    killProcess(id: PID): void {
        let pinfo = this.processTable[id];
        if (!pinfo) return;
        this.log.warn(`${id} killed`);
        pinfo.ex = false;
        pinfo.end = Game.time;
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
        this._curTickIDs = [];
        this._curThreadData = {};

        for (let i = 0; i < processIDs.length; i++) {
            this.PrepTick(processIDs[i]);
        }

        if (this._curTickIDs.length == 0) {
            this.startProcess(PKG_SwarmManager, {});
            return;
        }

        let activeThreadIDs = CopyObject(this._curTickIDs);
        while (activeThreadIDs.length > 0) {
            let curThread = this.getProcessByPID(activeThreadIDs[0])!;
            let threadResult = curThread.RunThread();
            switch (threadResult) {
                case (ThreadState_Waiting):
                case (ThreadState_Inactive):
                case (ThreadState_Done):
                case (ThreadState_Overrun): // (TODO): Turn Overrun into a thread state that allows the thread to do extra work as cpu is available.
                    activeThreadIDs.shift();
                case (ThreadState_Active): continue;;
                default:
                    activeThreadIDs.shift();
                    continue;
            }
        }

        for (let i = 0; i < this._curTickIDs.length; i++) {
            this.EndTick(this._curTickIDs[i]);
        }
    }

    private PrepTick(pid: PID) {
        let pInfo = this.processTable[pid];
        try {
            if (pInfo.sl) {
                if (pInfo.sl! <= Game.time) {
                    this.wake(pid);
                } else {
                    return;
                }
            }

            let proc = this.getProcessByPID(pid)!;
            if (proc.PrepTick) {
                proc.PrepTick();
            }
            this._curTickIDs.push(pid);
        } catch (e) {
            this.killProcess(pid);
            pInfo.err = e.stack || e.toString();
            this.log.error(`[${pid}] ${pInfo.PKG} crashed\n${e.stack}`);
        }
    }
    private EndTick(pid: PID) {
        let pInfo = this.processTable[pid];
        let proc = this.getProcessByPID(pid);
        if (proc && proc.EndTick) {
            try {
                proc.EndTick();
            } catch (e) {
                this.killProcess(pid);
                pInfo.err = e.stack || e.toString();
                this.log.error(`[${pid}] ${pInfo.PKG} crashed\n${e.stack}`);
            }
        }

        if (!pInfo.ex) {
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
    // (TODO): Add awoken threads back to the list of activeThreadIDs.  Do prep if necessary.
    wake(pid: PID): void {
        if (this.processTable[pid] && this.processTable[pid].sl) {
            delete this.processTable[pid].sl;
        }
    }
}