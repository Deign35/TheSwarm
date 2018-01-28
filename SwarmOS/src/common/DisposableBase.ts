import { DelegateBase } from './Delegate';
export class DisposableBase implements IDisposable {
    constructor(public id: string) {
        DisposalDelegate.subscribe(id, this);
    }
    dispose(): void {
        DisposalDelegate.unsubscribe(this.id);
        delete this.dispose;
    }
}
export class DisposalDelegate extends DelegateBase<DisposableCallback<DisposableBase>> {
    constructor() {
        super();
        if (!DisposalDelegate._instance) {
            DisposalDelegate._instance = this;
        }
    }

    private static _instance: DisposalDelegate;
    static subscribe(id: string, disposableObject: DisposableBase) {
        this._instance.Subscribe(id, disposableObject.dispose);
    }
    static unsubscribe(id: string) {
        this._instance.Unsubscribe(id);
    }
    static DiposeAll() {
        this._instance.Notify();
    }
} global['DisposeAll'] = new DisposalDelegate() && DisposalDelegate;

export function using<T extends DisposableBase>(disposableObject: T, disposableAction: DisposableCallback<T>) {
    try {
        disposableAction(disposableObject);
    } finally {
        disposableObject.dispose();
    }
} global['using'] = using;

/* Proper use of this function:
    using(new SomeObj(), (myObj: SomeObj) => {
        myObj.DoStuff();
    }); // Dispose is called when this function goes out of scope.
*/