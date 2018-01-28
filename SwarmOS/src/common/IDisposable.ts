import { Delegate } from './Delegate';
export class IDisposable {
    constructor(public id: string) {
        DisposalDelegate.subscribe(id, this);
    }
    dispose(): void {
        DisposalDelegate.unsubscribe(this.id);
    }
} global['IDisposable'] = IDisposable;
/* Proper use of this function:
using(new SomeObj(), (myObj: SomeObj) => {
    myObj.DoStuff();
}); // Dispose is called after this function completes.
*/

export function using<T extends IDisposable>(disposableObject: T, disposableAction: DisposeDelegate<T>) {
    try {
        disposableAction(disposableObject);
    } finally {
        disposableObject.dispose();
    }
} global['using'] = using;

export class DisposalDelegate extends Delegate<DisposeCallback<IDisposable>> {
    constructor() {
        super();
        if (!DisposalDelegate._instance) {

        }
    }

    private static _instance: DisposalDelegate;
    static subscribe(id: string, disposableObject: IDisposable) {
        this._instance.subscribe(id, disposableObject.dispose);
    }
    static unsubscribe(id: string) {
        this._instance.unsubscribe(id);
    }
    static DiposeAll() {
        this._instance.Notify();
    }
} global['DisposeAll'] = new DisposalDelegate() && DisposalDelegate;