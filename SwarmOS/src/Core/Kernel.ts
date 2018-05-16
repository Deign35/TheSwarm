import { Logger } from "Core/Logger";

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
export class Kernel implements IKernel, IKernelProcessExtensions, IKernelSleepExtension {
    constructor(private processRegistry: IProcessRegistry, private extensionRegistry: IExtensionRegistry, private _logger: IKernelLoggerExtensions) {
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
            notifications: []
        };
        return Memory.kernel;
    }
    get processTable(): ProcessTable {
        return this.memory.processTable;
    }
    get processMemory(): ProcessMemory {
        return this.memory.processMemory;
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
        let pid = 'p' + GetSUID() as PID;
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
        let notifications = {};
        for (let i = 0; i < this.memory.notifications.length; i++) {
            let notifyID = this.memory.notifications[i];
            if (!this.memory.subscriptions[notifyID]) { continue; }

            for (let j = 0; j < this.memory.subscriptions[notifyID].length; j++) {
                let subscriberPID = this.memory.subscriptions[notifyID][j];
                if (!notifications[subscriberPID]) {
                    notifications[subscriberPID] = true;
                }
            }
        }
        this.memory.notifications = [];
        let processIDs = Object.keys(this.processTable);

        let hasActiveProcesses = false;
        for (let i = 0; i < processIDs.length; i++) {
            let pid = processIDs[i];
            let pInfo = this.processTable[pid];
            if (!pInfo.ex) {
                let proc = this.getProcessById(pid);
                if (proc) {
                    proc.onProcessEnd();
                }
                delete this.processTable[pid];
                delete this.processMemory[pid];
                delete this._processCache[pid];
                continue;
            }
            hasActiveProcesses = true;
            try {
                let proc = this.getProcessById(pid);
                if (!proc) throw new Error(`Could not get process ${pid} ${pInfo.PKG}`);
                this.curProcessID = pid;

                if (this.processTable[pid].sl) {
                    if (notifications[pid] || (this.processTable[pid].sl! <= Game.time)) {
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
        if (this.memory.processTable[pid] && this.memory.processTable[pid].sl) {
            delete this.memory.processTable[pid].sl;
            // (TODO): Don't let newly awoken processes run this tick.
        }
    }

    protected IsSubscribed(id: string, pid: PID) {
        if (this.memory.subscriptions[id]) {
            for (let i = 0; i < this.memory.subscriptions[id].length; i++) {
                if (this.memory.subscriptions[id][id] == pid) {
                    return true;
                }
            }
        }

        return false;
    }

    Subscribe(id: string) {
        if (!this.memory.subscriptions[id]) {
            this.memory.subscriptions[id] = []
        }
        if (!this.IsSubscribed(id, this.curProcessID)) {
            this.memory.subscriptions[id].push(this.curProcessID);
        }
    }
    UnSubscribe(id: string) {
        if (this.memory.subscriptions[id]) {
            for (let i = 0; i < this.memory.subscriptions[id].length; i++) {
                if (this.memory.subscriptions[id][i] == this.curProcessID) {
                    this.memory.subscriptions[id].splice(i, 1);
                    return;
                }
            }
        }
    }

    Notify(id: string) {
        this.memory.notifications.push(id);
    }
}