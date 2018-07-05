import { FileSystem } from "Core/FileSystem/FileSystem";
import { profile } from "Tools/Profiler";

const TS_Active = 1;
const TS_Waiting = 2;
const TS_Done = 3;

const KERNEL_FOLDER_NAME = 'Kernel'
const KERNEL_FOLDER_PATH = C_SEPERATOR + KERNEL_FOLDER_NAME;

declare type TS_Active = 1;
declare type TS_Waiting = 2;
declare type TS_Done = 3;
declare type TickState = TS_Active | TS_Waiting | TS_Done;

@profile
export class Kernel implements IKernel, IKernelExtensions, IKernelSleepExtension {
    constructor(private processRegistry: IProcessRegistry, private extensionRegistry: IExtensionRegistry,
        private _logger: IKernelLoggerExtensions) {
        this._processCache = {};
    }
    private _processCache: IDictionary<PID, IProcess>;
    private _curTickState!: IDictionary<PID, TickState>;
    private _procTableFile!: IFile<ProcessTable>;
    private _errorFile!: IFile<string[]>;

    get log() {
        return this._logger;
    }
    get processTable(): ProcessTable {
        return this._procTableFile.contents;
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
        global['MasterFS'] = new FileSystem();
        MasterFS.EnsurePath(KERNEL_FOLDER_PATH);
        let folder = MasterFS.GetFolder(KERNEL_FOLDER_PATH)!;
        this._procTableFile = folder.GetFile<ProcessTable>('procTable')!;
        if (!this._procTableFile) {
            folder.SaveFile('procTable', {});
            this._procTableFile = folder.GetFile<ProcessTable>('procTable')!;
        }
        this._errorFile = folder.GetFile<string[]>('errors')!;
        if (!this._errorFile) {
            folder.SaveFile('errors', {});
            this._errorFile = folder.GetFile<string[]>('errors')!;
        }
    }

    startProcess(packageName: ScreepsPackage, memPath: string, startMem: MemBase, opts?: {
        parentPID?: PID,
        desiredPID?: PID
    }): PID {
        let newPID: PID = (opts && opts.desiredPID) || 'p' + GetSUID();
        while (this.processTable[newPID] && !this.processTable[newPID].end) {
            newPID += '_' + GetSUID();
        }
        let folder = MasterFS.GetFolder(memPath);
        if (!folder) {
            throw new Error(`Could not create memory for new process.  Kernel.startProcess(${packageName}, ${memPath}, ${JSON.stringify(startMem)}, ${JSON.stringify(opts)})`)
        }
        folder.SaveFile(newPID, startMem);
        let file = folder.GetFile(newPID)!;
        let pInfo: ProcInfo = {
            PKG: packageName,
            path: file.folderPath
        };
        this.processTable[newPID] = pInfo;
        this.setParent(newPID, opts && opts.parentPID);

        this.PrepTick(newPID);
        return newPID;
    }

    createProcess(id: PID): IProcess {
        this.log.debug(`ConstructProcess ${id}`);
        let pInfo = this.processTable[id];
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
                return kernelContext.processTable[this.pid] && !kernelContext.processTable[this.pid].end;
            },
            get pPID() {
                return kernelContext.processTable[this.pid] && kernelContext.processTable[this.pid].pP || "";
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
        let pInfo = this.processTable[id];
        if (!pInfo) return;
        if (msg) {
            this.log.info(`${id} killed - ${msg}`);
        }
        pInfo.end = Game.time;
        let ids = Object.keys(this.processTable);
        for (let i = 0; i < ids.length; i++) {
            let otherPI = this.processTable[ids[i]]
            if (otherPI && !otherPI.end && otherPI.pP === ids[i]) {
                this.killProcess(ids[i], msg);
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

    setParent(pid: PID, parentPID?: PID): boolean {
        if (!this.processTable[pid]) {
            return false;
        }
        if (parentPID && !this.getProcessByPID(parentPID)) {
            return false;
        }
        this.processTable[pid].pP = parentPID;
        return true;
    }

    loop() {
        this.LoadFileSystem();
        this._curTickState = {};
        let processIDs = Object.keys(this.processTable);
        for (let i = 0; i < processIDs.length; i++) {
            let pInfo = this.processTable[processIDs[i]];
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
        if (activeThreadIDs.length == 0) {
            let emptyMem: MemBase = {
            }
            MasterFS.CreateFolder('', KERNEL_FOLDER_NAME);
            this.startProcess(PKG_CLIProcessor, KERNEL_FOLDER_PATH, {}, {
                desiredPID: 'CLI',
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
            let proc = this.getProcessByPID(pid);
            if (proc && !this.processTable[pid].end) {
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
            delete this._curTickState[pid];
        }

        if (pInfo.end && pInfo.end + 100 <= Game.time) {
            if (pInfo.err) {
                this._errorFile.contents[pid + '_' + pInfo.end] = pInfo.err;
            }
            delete this.processTable[pid];
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