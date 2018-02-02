import { Delegate } from './Delegate';
export abstract class Disposable implements IDisposable {
    constructor(public id: string) {
        DisposalDelegate.subscribe(id, this);
    }
    dispose(): void {
        DisposalDelegate.unsubscribe(this.id);
        delete this.dispose; // Will cause an error if dispose is called again.
    }
}
export class DisposalDelegate extends Delegate<DisposableCallback<IDisposable>> {
    constructor() {
        super();
        if (!DisposalDelegate._instance) {
            DisposalDelegate._instance = this;
        }
    }

    private static _instance: DisposalDelegate;
    static subscribe(id: string, disposableObject: IDisposable) {
        this._instance.Subscribe(id, disposableObject.dispose);
    }
    static unsubscribe(id: string) {
        this._instance.Unsubscribe(id);
    }
    static DiposeAll() {
        this._instance.Notify();
    }
} global['DisposeAll'] = new DisposalDelegate() && DisposalDelegate;

export function using<T extends IDisposable>(disposableObject: T, disposableAction: DisposableCallback<T>) {
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