declare var Memory: {
    kernel: KernelMemory
}

declare type ProcessCache = {
    [id: string]: {
        context: IProcessContext,
        process: IProcess
    }
}

declare type ProcessWithID = { pid: PID; process: IProcess; };

const PROCESS_GHOST_TIMER = 100;
export class Kernel implements IKernel, IKernelSleepExtension {
    private _processCache: ProcessCache;
    private curProcessID: string = "";
    protected get log() {
        return Logger;
    }
    get memory(): KernelMemory {
        Memory.kernel = Memory.kernel || { processTable: {}, processMemory: {} };
        return Memory.kernel;
    }
    get processTable(): ProcessTable {
        return this.memory.processTable;
    }
    get processMemory(): ProcessMemory {
        return this.memory.processMemory;
    }

    constructor(private processRegistry: IProcessRegistry, private extensionRegistry: IExtensionRegistry) {
        this._processCache = {};
    }

    installBundle(bundle: IPackage<{}>) {
        bundle.install(this.processRegistry, this.extensionRegistry);
    }
    installPackages(bundles: IPackage<{}>[]) {
        for (let id in bundles) {
            this.installBundle(bundles[id]);
        }
    }

    startProcess(processName: string, startContext: any): ProcessWithID | undefined {
        let pid = GetSUID() as PID;
        let pInfo: ProcInfo = {
            pid: pid,
            pP: this.curProcessID,
            PKG: processName,
            ex: true,
            st: Game.time,
        };

        this.processTable[pid] = pInfo;
        this.processMemory[pid] = startContext || {};

        let process = this.createProcess(pid);
        this.log.debug(`CreateNewProcess: ${processName}`);
        return { pid, process };
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
            imageName: pInfo.PKG,
            get isActive() {
                return kernelContext.processTable[id] && kernelContext.processTable[id].ex;
            },
            get pPID() {
                return kernelContext.processTable[id] && kernelContext.processTable[id].pP || "";
            },
            get memory() {
                return kernelContext.processMemory[pInfo.pid];
            },
            // bind getExtension to queryPosisInterface.
            queryPosisInterface: kernelContext.extensionRegistry.getExtension.bind(kernelContext.extensionRegistry)
        };
        Object.freeze(context);
        let process = this.processRegistry.createNewProcess(pInfo.PKG, context);
        if (!process) throw new Error(`Could not create process ${pInfo.pid} ${pInfo.PKG}`);
        this._processCache[id] = { context, process };
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

    getProcessById(pid: PID): IProcess | undefined {
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
                continue;
            }
            hasActiveProcesses = true;
            try {
                let proc = this.getProcessById(pid);
                if (!proc) throw new Error(`Could not get process ${pid} ${pInfo.PKG}`);
                this.curProcessID = pid;

                if (this.processTable[pid].sl) {
                    if (this.processTable[pid].sl == Game.time) {
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
        if (!hasActiveProcesses)
            this.startProcess(PKG_SwarmManager, {});
    }

    sleep(ticks: number): void {
        let pInfo = this.processTable[this.curProcessID];
        pInfo.sl = Game.time + ticks;
    }
    wake(pid: PID): void {
        delete this.memory.processTable[pid].sl
    }
}