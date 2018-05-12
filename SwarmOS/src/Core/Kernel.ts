declare var Memory: {
    kernel: KernelMemory
}

declare type ProcessCache = {
    [id: string]: {
        context: IPosisProcessContext,
        process: IPosisProcess
    }
}

declare type ProcessWithID = { pid: PID; process: IPosisProcess; };

const PROCESS_GHOST_TIMER = 100;
export class Kernel implements IPosisKernel, IPosisSleepExtension {
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
    get processMemory(): ProcessMemoryTable {
        return this.memory.processMemory;
    }

    constructor(private processRegistry: IPosisProcessRegistry, private extensionRegistry: IPosisExtensionRegistry) {
        this._processCache = {};
    }

    installBundle(bundle: IPosisBundle<{}>) {
        bundle.install(this.processRegistry, this.extensionRegistry);
    }
    installBundles(bundles: IPosisBundle<{}>[]) {
        for (let id in bundles) {
            this.installBundle(bundles[id]);
        }
    }

    startProcess(processName: string, startContext: any): ProcessWithID | undefined {
        let pid = GetSUID() as PID;
        let pInfo: ProcessInfo = {
            pid: pid,
            pPID: this.curProcessID,
            name: processName,
            running: true,
            begun: Game.time
        };

        this.processTable[pid] = pInfo;
        this.processMemory[pid] = startContext || {};

        let process = this.createProcess(pid);
        this.log.debug(`CreateNewProcess: ${processName}`);
        return { pid, process };
    }

    createProcess(id: PID): IPosisProcess {
        this.log.debug(`ConstructProcess ${id}`);
        let pInfo = this.processTable[id];
        if (!pInfo) {
            throw new Error(`Process ${id} does not exist`)
        }

        let kernelContext = this;
        let context: IPosisProcessContext = {
            pid: pInfo.pid,
            imageName: pInfo.name,
            get isActive() {
                return kernelContext.processTable[id] && kernelContext.processTable[id].running;
            },
            get pPID() {
                return kernelContext.processTable[id] && kernelContext.processTable[id].pPID || "";
            },
            get memory() {
                return kernelContext.processMemory[pInfo.pid];
            },
            // bind getExtension to queryPosisInterface.
            queryPosisInterface: kernelContext.extensionRegistry.getExtension.bind(kernelContext.extensionRegistry)
        };
        Object.freeze(context);
        let process = this.processRegistry.getNewProcess(pInfo.name, context);
        if (!process) throw new Error(`Could not create process ${pInfo.pid} ${pInfo.name}`);
        this._processCache[id] = { context, process };
        return process;
    }

    // killProcess also kills all children of this process
    // note to the wise: probably absorb any calls to this that would wipe out your entire process tree.
    killProcess(id: PID): void {
        let pinfo = this.processTable[id];
        if (!pinfo) return;
        this.log.warn(`killed ${id}`);
        pinfo.running = false;
        pinfo.ended = Game.time;
        if (pinfo.pPID == '') return
        let ids = Object.keys(this.processTable);
        for (let i = 0; i < ids.length; i++) {
            let id = ids[i];
            let pi = this.processTable[id]
            if (pi.pPID === pinfo.pid) {
                if (pi.running) {
                    this.killProcess(id);
                }
            }
        }
    }

    getProcessById(pid: PID): IPosisProcess | undefined {
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
        this.processTable[pid].pPID = parentPId;
        return true;
    }

    loop() {
        let processIDs = Object.keys(this.processTable);
        /*if (processIDs.length === 0) {
            let proc = this.startProcess("init", {});
            // Due to breaking changes in the standard, 
            // init can no longer be ran on first tick.
            if (proc) processIDs.push(proc.pid.toString());
        }*/

        let hasActiveProcesses = false;
        for (let i = 0; i < processIDs.length; i++) {
            let pid = processIDs[i];
            let pInfo = this.processTable[pid];
            if (!pInfo.running) {
                delete this.processTable[pid];
                delete this.processMemory[pid];
                continue;
            }
            hasActiveProcesses = true;
            try {
                let proc = this.getProcessById(pid);
                if (!proc) throw new Error(`Could not get process ${pid} ${pInfo.name}`);
                this.curProcessID = pid;

                if (this.processTable[pid].wake) {
                    if (this.processTable[pid].wake == Game.time) {
                        this.wake(this.curProcessID);
                    }
                }
                if (!this.processTable[pid].wake) {
                    proc.run();
                }

                this.curProcessID = "";
            } catch (e) {
                this.killProcess(pid);
                pInfo.error = e.stack || e.toString();
                this.log.error(`[${pid}] ${pInfo.name} crashed\n${e.stack}`);
            }
        }
        if (!hasActiveProcesses)
            this.startProcess(PKG_SwarmManager, {});
    }

    sleep(ticks: number): void {
        let pInfo = this.processTable[this.curProcessID];
        pInfo.wake = Game.time + ticks;
    }
    wake(pid: PID): void {
        delete this.memory.processTable[pid].wake
    }
}