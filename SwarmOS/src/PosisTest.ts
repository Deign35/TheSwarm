// From unfleshedone
// Root process expects to be started with 'startContext = { maxRunTime: N }'

interface POSISTest_BaseProcessMemory {
    started?: number;
    lastTick?: number;
    supposedToBeDead?: boolean;

    // set by start context
    maxRunTime?: number;
}

class BaseSwarmProcess implements IPosisProcess {
    public testName = "POSIS base:";
    public static ImageName = "SwarmBase/PosisBaseTestProcess";

    constructor(private context: IPosisProcessContext) {

    }

    public get tmemory(): POSISTest_BaseProcessMemory {
        return this.memory as POSISTest_BaseProcessMemory;
    }

    public run(): void {
        let kernel: IPosisKernel = this.context.queryPosisInterface("kernel") as IPosisKernel;
        let fatal = false;

        if (Logger === undefined)
            throw Error(`${this.testName}: 'log' is not set`);

        if (this.memory === undefined) {
            Logger.error(`${this.testName}: 'memory' not set`);
            fatal = true;
        }

        Logger.info(`${this.testName}: starting basic diagnostics`);

        Logger.trace(`${this.testName}: trace message`);
        Logger.debug(`${this.testName}: debug message`);
        Logger.info(`${this.testName}: info message`);
        Logger.warn(`${this.testName}: warn message`);
        Logger.error(`${this.testName}: error message`);
        Logger.fatal(`${this.testName}: fatal message`)

        if (this.imageName === undefined)
            Logger.error(`${this.testName}: 'imageName' not set`);

        if (this.imageName !== BaseSwarmProcess.ImageName)
            Logger.error(`${this.testName}: 'imageName' not matching, expected: '${BaseSwarmProcess.ImageName}', actual '${this.imageName}'`);

        if (this.id === undefined)
            Logger.error(`${this.testName}: 'id' not set`);

        if (this.parentId === undefined)
            Logger.error(`${this.testName}: 'parentId' not set`);

        Logger.info(`${this.testName}: basic diagnostics completed`);

        if (fatal) {
            Logger.error(`${this.testName}: fatal errors, trying to exit`);
            kernel.killProcess(this.id);
            return;
        }

        if (this.tmemory.started === undefined) {
            this.tmemory.started = Game.time;
            this.tmemory.lastTick = Game.time;
        }

        if (this.tmemory.supposedToBeDead)
            Logger.error(`${this.testName}: can't exit`);

        Logger.info(`${this.testName}: started on ${this.tmemory.started}, running for ${Game.time - this.tmemory.started!}`);

        if (this.tmemory.maxRunTime === undefined) {
            Logger.error(`${this.testName}: 'maxRunTime' is not set, arguments are not passed, or broken`);
            return;
        }

        if (Game.time - this.tmemory.started! >= this.tmemory.maxRunTime!) {
            this.tmemory.supposedToBeDead = true;
            kernel.killProcess(this.id);
        }

        this.tmemory.lastTick = Game.time;
    }

    // ==================================
    // Host OS is providing everything below
    get memory(): any { // private memory
        return this.context.memory;
    }
    get imageName(): string { // image name (maps to constructor)
        return this.context.imageName;
    }
    get id(): PID { // ID
        return this.context.pid;
    }
    get parentId(): PID { // Parent ID
        return this.context.pPID;
    }
}

// tslint:disable-next-line:max-classes-per-file
export const bundle: IPosisBundle<{}> = {
    install(registry: IPosisProcessRegistry) {
        registry.register(BaseSwarmProcess.ImageName, BaseSwarmProcess);
    }
}