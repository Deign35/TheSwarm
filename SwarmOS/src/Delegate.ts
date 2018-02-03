export class Delegate<T extends CallbackFunction> implements IDelegate<T> {
    private _callbackFunctions: { [id: string]: T } = {};
    Subscribe(id: string, callback: T) {
        this._callbackFunctions[id] = callback;
    }
    Unsubscribe(id: string) {
        delete this._callbackFunctions[id];
    }
    Notify(...args: any[]) {
        for (let name in this._callbackFunctions) {
            this._callbackFunctions[name](args); // Need a delegate that allows me to return and process after each return.
        }
    }
}