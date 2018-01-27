export class IDisposable {
    constructor() { }
    dispose(): void { }
}
declare type DisposeDelegate<T> = (disposableObject: T) => void;
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
}