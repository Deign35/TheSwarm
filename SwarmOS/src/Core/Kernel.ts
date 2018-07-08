const TS_Active = 1;
const TS_Waiting = 2;
const TS_Done = 3;

declare type TS_Active = 1;
declare type TS_Waiting = 2;
declare type TS_Done = 3;
declare type TickState = TS_Active | TS_Waiting | TS_Done;

const CORE_FOLDER_PATH = 'Core';
export class Kernel implements IKernel, IKernelExtensions, IKernelSleepExtension {
    constructor(private processRegistry: IProcessRegistry, private extensionRegistry: IExtensionRegistry,
        private _logger: IKernelLoggerExtensions) {
        this._processCache = {};
        this.LoadFileSystem();
    }
    private _processCache: IDictionary<PID, IProcess>;
    private _curTickState!: IDictionary<PID, TickState>;
    private _procTableFile!: IFile<ProcessTable>;
    private _errorFile!: IFile<IDictionary<string, string>>;

    get log() {
        return this._logger;
    }
    get processTable(): IFile<ProcessTable> {
        return this._procTableFile;
    }

    installPackage(pack: IPackage<{}>) {
        pack.install(this.processRegistry, this.extensionRegistry);
    }
    installPackages(pack: IPackage<{}>[]) {
        for (let id in pack) {
            this.installPackage(pack[id]);
        }
    }

    protected LoadFileSystem() {
        MasterFS.EnsurePath(`${SEG_Master_Drive}${C_SEPERATOR}${CORE_FOLDER_PATH}`);
        let folder = MasterFS.GetFolder(`${SEG_Master_Drive}${C_SEPERATOR}${CORE_FOLDER_PATH}`)!;
        this._procTableFile = folder.GetFile<ProcessTable>('procTable')!;
        if (!this._procTableFile) {
            folder.CreateFile('procTable');
            this._procTableFile = folder.GetFile<ProcessTable>('procTable')!;
        }
        this._errorFile = folder.GetFile<IDictionary<string, string>>('errors')!;
        if (!this._errorFile) {
            folder.CreateFile('errors');
            this._errorFile = folder.GetFile<IDictionary<string, string>>('errors')!;
        }
    }

    startProcess(packageName: ScreepsPackage, memPath: string, opts?: {
        parentPID?: PID,
        desiredPID?: PID
    }): PID {
        let newPID: PID = (opts && opts.desiredPID) || 'p' + GetSUID();
        while (this.processTable.Get(newPID) && !this.processTable.Get(newPID).end) {
            newPID += '_' + GetSUID();
        }
        let folder = MasterFS.GetFolder(memPath);
        if (!folder) {
            throw new Error(`Could not create memory for new process.  Kernel.startProcess(${packageName}, ${memPath}, ${JSON.stringify(opts)})`)
        }
        let pInfo: ProcInfo = {
            PKG: packageName,
            path: memPath
        };
        this.processTable.Set(newPID, pInfo);
        this.setParent(newPID, opts && opts.parentPID);

        this.PrepTick(newPID);
        return newPID;
    }

    createProcess(id: PID): IProcess {
        this.log.debug(`ConstructProcess ${id}`);
        let pInfo = this.processTable.Get(id);
        if (!pInfo) {
            throw new Error(`Process ${id} does not exist`);
        }

        let kernelContext = this;
        let loggerContext = kernelContext.log.CreateLogContext(pInfo.PKG, DEFAULT_LOG_LEVEL);
        let context: IProcessContext = {
            pid: id,
            pkgName: pInfo.PKG,
            rngSeed: GetRandomIndex(primes_3000),
            memPath: pInfo.path,
            get isActive() {
                return kernelContext.processTable.Get(this.pid) && !kernelContext.processTable.Get(this.pid).end;
            },
            get pPID() {
                return kernelContext.processTable.Get(this.pid) && kernelContext.processTable.Get(this.pid).pP || "";
            },
            get log() {
                return loggerContext;
            },
            extensionRegistry: kernelContext.extensionRegistry.get.bind(kernelContext.extensionRegistry)
        };
        Object.freeze(context);
        let process = this.processRegistry.createNewProcess(pInfo.PKG, context);
        if (!process) {
            throw new Error(`Could not create process ${id} ${pInfo.PKG}`);
        }
        this._processCache[id] = process;
        if (process.PrepTick) {
            process.PrepTick();
        }
        return process;
    }

    killProcess(id: PID, msg: string): void {
        let pInfo = this.processTable.Get(id);
        if (!pInfo) return;
        if (msg) {
            this.log.info(`${id} killed - ${msg}`);
        }
        pInfo.end = Game.time;
        let ids = this.processTable.GetDataIDs();
        for (let i = 0; i < ids.length; i++) {
            let otherPI = this.processTable.Get(ids[i]);
            if (otherPI && !otherPI.end && otherPI.pP === ids[i]) {
                this.killProcess(ids[i], msg);
            }
        }
    }

    getProcessByPID(pid: PID): IProcess | undefined {
        if (!this.processTable.Get(pid) || this.processTable.Get(pid).end) {
            return;
        }
        if (!this._processCache[pid]) {
            this.createProcess(pid);
        }
        return this._processCache[pid];
    }

    setParent(pid: PID, parentPID?: PID): boolean {
        if (!this.processTable.Get(pid)) {
            return false;
        }
        if (parentPID && !this.getProcessByPID(parentPID)) {
            return false;
        }
        this.processTable.Get(pid).pP = parentPID;
        return true;
    }

    loop() {
        this.LoadFileSystem();
        this._curTickState = {};
        let processIDs = this.processTable.GetDataIDs();
        for (let i = 0; i < processIDs.length; i++) {
            let pInfo = this.processTable.Get(processIDs[i]);
            if (pInfo.end) continue;
            if (pInfo.sl) {
                if (pInfo.sl! <= Game.time) {
                    this.wake(processIDs[i]);
                }
            }
            if (!pInfo.sl) {
                this.PrepTick(processIDs[i]);
            }
        }

        let activeThreadIDs = Object.keys(this._curTickState);
        if (activeThreadIDs.length == 0 || !this.getProcessByPID('pl')) {
            MasterFS.EnsurePath(SEG_Master_Drive);
            this.startProcess(PKG_Player, SEG_Master_Drive, {
                desiredPID: 'pl',
            })
            // Initialization doesn't work on the first tick for some reason.  So skip the first tick.
            return;
        }

        let loopStates = {};
        while (activeThreadIDs.length > 0) {
            this.RunThreads(activeThreadIDs);
            activeThreadIDs = [];
            let allIDs = Object.keys(this._curTickState);
            for (let i = 0; i < allIDs.length; i++) {
                let state = this._curTickState[allIDs[i]]
                if (state == TS_Waiting || state == TS_Active) {
                    activeThreadIDs.push(allIDs[i]);
                    this._curTickState[allIDs[i]] = TS_Active;
                }
            }

            let stringified = JSON.stringify(activeThreadIDs);
            if (!loopStates[stringified]) {
                loopStates[stringified] = true;
            } else {
                this.log.alert(`A cycle has repeated a previous position. -- ${stringified}`);
                break;
            }
        }

        processIDs = this.processTable.GetDataIDs();
        for (let i = 0; i < processIDs.length; i++) {
            this.EndTick(processIDs[i]);
        }
    }

    private RunThreads(ids: PID[]) {
        while (ids.length > 0) {
            let pid = ids.shift()!;
            let pInfo = this.processTable.Get(pid);
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
                    case (ThreadState_Done):
                        this._curTickState[pid] = TS_Done;
                    default:
                        break;
                }
            } catch (e) {
                let pInfo = this.processTable.Get(pid);
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
        let pInfo = this.processTable.Get(pid);
        try {
            let proc = this.getProcessByPID(pid);
            if (proc && !pInfo.end) {
                if (proc.PrepTick) {
                    proc.PrepTick();
                }
                this._curTickState[pid] = TS_Active;
            }
        } catch (e) {
            this.killProcess(pid, `Kernel.PrepTick()`);
            pInfo.err = e.stack || e.toString();
            this.log.error(`[${pid}] ${pInfo.PKG} crashed\n${e.stack}`);
        }
    }

    private EndTick(pid: PID) {
        let pInfo = this.processTable.Get(pid);
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
            delete this._curTickState[pid];
        }

        if (pInfo.end && pInfo.end + 100 <= Game.time) {
            if (pInfo.err) {
                this._errorFile.Set(pid + '_' + pInfo.end, pInfo.err);
            }
            this.processTable.Remove(pid);
            delete this._processCache[pid];
            return;
        }
    }

    sleep(pid: PID, ticks: number): void {
        let pInfo = this.processTable.Get(pid);
        pInfo.sl = Game.time + ticks;
    }

    wake(pid: PID): void {
        let pInfo = this.processTable.Get(pid);
        if (pInfo && pInfo.sl) {
            delete pInfo.sl;
            this.PrepTick(pid);
            this._curTickState[pid] = TS_Waiting;
        }
    }
}