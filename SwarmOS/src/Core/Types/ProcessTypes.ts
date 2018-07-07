export abstract class ProcessBase implements IProcess {
    constructor(protected context: IProcessContext) { }
    @extensionInterface(EXT_Registry)
    protected extensions!: IExtensionRegistry;
    @extensionInterface(EXT_Kernel)
    protected kernel!: IKernelExtensions;

    get log() { return this.context.log; }  // (TODO): Make registration include log values for the context?
    get rngSeed(): number { return this.context.rngSeed; }
    get pkgName(): string { return this.context.pkgName; }
    get pid(): PID { return this.context.pid; }
    get parentPID(): PID { return this.context.pPID; }
    get memPath(): string { return this.context.memPath; }
    get memFolder(): IFolder { return this._folder; }
    GetParentProcess<K extends IProcess>(): K | undefined {
        return this.parentPID ? this.kernel.getProcessByPID(this.parentPID) as K : undefined;
    }
    private _folder!: IFolder;
    PrepTick(): void {
        this._folder = MasterFS.GetFolder(`${this.memPath}`)!;
        if (this.OnTickStart) {
            this.OnTickStart();
        }
    }
    OnTickStart?(): void;
    abstract RunThread(): ThreadState;
    EndTick?(): void;

    private _hasEnded = false;
    OnChildProcessEnd?(proc: ProcessBase, endReason: string): void;
    EndProcess(endReason: string) {
        if (this._hasEnded) {
            return;
        }
        this._hasEnded = true;
        let proc = this.GetParentProcess();
        if (proc && proc.OnChildProcessEnd) {
            proc.OnChildProcessEnd(this, endReason);
        }
        this.kernel.killProcess(this.pid, endReason);
    }
}

function extensionInterface(interfaceID: string): (target: any, propertyKey: string) => any {
    return function (target: any, propertyKey: string): any {
        let value: IPackageExtension
        return {
            get() {
                if (!value) {
                    value = this.context.extensionRegistry(interfaceID);
                }
                return value;
            }
        }
    }
}
global['extensionInterface'] = extensionInterface;