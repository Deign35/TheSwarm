export abstract class ProcessBase<T extends MemBase> implements IProcess {
    constructor(protected context: IProcessContext) { }
    @extensionInterface(EXT_Registry)
    protected extensions!: IExtensionRegistry;
    @extensionInterface(EXT_Kernel)
    protected kernel!: IKernelExtensions;

    private _procFile!: IFile<T>;
    get memory(): T { return this._procFile.contents; }
    get log() { return this.context.log; }  // (TODO): Make registration include log values for the context?
    get rngSeed(): number { return this.context.rngSeed; }
    get pkgName(): string { return this.context.pkgName; }
    get pid(): PID { return this.context.pid; }
    get parentPID(): PID { return this.context.pPID; }
    GetParentProcess<K extends IProcess>(): K | undefined {
        return this.parentPID ? this.kernel.getProcessByPID(this.parentPID) as K : undefined;
    }

    PrepTick(): void {
        this._procFile = MasterFS.GetFile<T>(this.context.memPath, this.pid)!;
        if (!this._procFile) {
            throw new Error(`BasicProcess.PrepTick(Process file missing: ${this.context.memPath}/::/${this.pid})`)
        }
        if (this.OnTickStart) {
            this.OnTickStart();
        }
    }
    OnTickStart?(): void;
    abstract RunThread(): ThreadState;
    EndTick?(): void;

    private _hasEnded = false;
    OnChildProcessEnd?(proc: ProcessBase<any>, endReason: string): void;
    EndProcess(endReason: string) {
        if (this._hasEnded) {
            return;
        }
        this._hasEnded = true;
        let proc = this.GetParentProcess();
        if (proc && proc.OnChildProcessEnd) {
            proc.OnChildProcessEnd(this, endReason);
        }
        MasterFS.DeleteFile(this.context.memPath, this.pid);
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