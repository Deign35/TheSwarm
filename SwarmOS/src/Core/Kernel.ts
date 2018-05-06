import { ProcessRegistry } from "Core/ProcessRegistry";
import { ExtensionRegistry } from "Core/ExtensionRegistry";


export class Kernel implements IPosisKernel, IPosisSleepExtension {
    private _processCache: {
        [id: string]: {
            context: IPosisProcessContext,
            process: IPosisProcess
        }
    };
    private curId: string = "";
    private logger: SwarmLogger = new SwarmLogger("[Kernel]");

    get memory(): KernelMemory {
        Memory.kernel = Memory.kernel || { processTable: {}, processMemory: {} };
        return Memory.kernel;
    }
    get processTable(): ProcessTable {
        this.memory.processTable = this.memory.processTable || {};
        return this.memory.processTable;
    }
    get processMemory(): ProcessMemoryTable {
        this.memory.processMemory = this.memory.processMemory || {};
        return this.memory.processMemory;
    }

    constructor(private processRegistry: ProcessRegistry, private extensionRegistry: ExtensionRegistry) {
        this._processCache = {};
    }

    UID(): string {
        return (Memory.IDGen++).toString()//("P" + Game.time.toString(26).slice(-6) + Math.random().toString(26).slice(-3)).toUpperCase();
    }

    startProcess(processName: string, startContext: any): { pid: PosisPID; process: IPosisProcess; } | undefined {
        let id = this.UID() as PosisPID;

        let pinfo: ProcessInfo = {
            id: id,
            pid: this.curId,
            name: processName,
            ns: `ns_${id}`,
            status: "running",
            started: Game.time
        };
        this.processTable[id] = pinfo;
        this.processMemory[pinfo.ns] = startContext || {};
        let process = this.createProcess(id);
        this.logger.debug(`startProcess ${processName}`);
        return { pid: id, process };
    }

    createProcess(id: PosisPID): IPosisProcess {
        this.logger.debug(`createProcess ${id}`);
        let pinfo = this.processTable[id];
        if (!pinfo || pinfo.status !== "running") throw new Error(`Process ${pinfo.id} ${pinfo.name} not running`);
        let self = this;
        let context: IPosisProcessContext = {
            id: pinfo.id,
            get parentId() {
                return self.processTable[id] && self.processTable[id].pid || "";
            },
            imageName: pinfo.name,
            logger: new SwarmLogger(`[${pinfo.id}) ${pinfo.name}]`),
            get memory() {
                self.processMemory[pinfo.ns] = self.processMemory[pinfo.ns] || {};
                return self.processMemory[pinfo.ns];
            },
            // bind getExtension to queryPosisInterface.
            queryPosisInterface: self.extensionRegistry.getExtension.bind(self.extensionRegistry)
        };
        Object.freeze(context);
        let process = this.processRegistry.getNewProcess(pinfo.name, context);
        if (!process) throw new Error(`Could not create process ${pinfo.id} ${pinfo.name}`);
        this._processCache[id] = { context, process };
        return process;
    }
    // killProcess also kills all children of this process
    // note to the wise: probably absorb any calls to this that would wipe out your entire process tree.
    killProcess(id: PosisPID): void {
        let pinfo = this.processTable[id];
        if (!pinfo) return;
        this.logger.warn(`killed ${id}`);
        pinfo.status = "killed";
        pinfo.ended = Game.time;
        if (pinfo.pid == '') return
        let ids = Object.keys(this.processTable);
        for (let i = 0; i < ids.length; i++) {
            let id = ids[i];
            let pi = this.processTable[id]
            if (pi.pid === pinfo.id) {
                if (pi.status == 'running')
                    this.killProcess(id);
            }
        }
    }

    getProcessById(id: PosisPID): IPosisProcess | undefined {
        if (this.processTable[id] && this.processTable[id].status === 'running') {
            if (this._processCache[id]) {
                return this._processCache[id].process;
            } else {
                return this.createProcess(id);
            }
        }
        return;
    }

    // passing undefined as parentId means "make me a root process"
    // i.e. one that will not be killed if another process is killed
    setParent(id: PosisPID, parentId?: PosisPID): boolean {
        if (!this.processTable[id]) return false;
        this.processTable[id].pid = parentId;
        return true;
    }

    loop() {
        let ids = Object.keys(this.processTable);
        if (ids.length === 0) {
            let proc = this.startProcess("init", {});
            // Due to breaking changes in the standard, 
            // init can no longer be ran on first tick.
            if (proc) ids.push(proc.pid.toString());
        }
        let runCnt = 0
        for (let i = 0; i < ids.length; i++) {
            let id = ids[i];
            let pinfo = this.processTable[id];
            if (pinfo.status !== "running" && (!pinfo.ended || pinfo.ended < Game.time - 100)) {
                delete this.processTable[id];
            }
            if (pinfo.wake && pinfo.wake > Game.time) continue;
            if (pinfo.status !== "running") continue;
            runCnt++
            try {
                let proc = this.getProcessById(id);
                if (!proc) throw new Error(`Could not get process ${id} ${pinfo.name}`);
                this.curId = id;
                proc.run();
                this.curId = "";
            } catch (e) {
                this.killProcess(id);
                pinfo.status = "crashed";
                pinfo.error = e.stack || e.toString();
                this.logger.error(`[${id}] ${pinfo.name} crashed\n${e.stack}`);
            }
        }
        if (runCnt == 0)
            this.startProcess("init", {});
    }

    sleep(ticks: number): void {
        let pinfo = this.processTable[this.curId]
        if (!pinfo) return
        pinfo.wake = Game.time + ticks
    }
}