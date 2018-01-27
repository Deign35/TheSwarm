type CallbackFunction = (...args: any[]) => void;
export class Delegate {
    callbackFunctions: { [id: string]: CallbackFunction } = {};
    subscribe(id: string, callback: CallbackFunction) {
        this.callbackFunctions[id] = callback;
    }
    unsubscribe(id: string) {
        delete this.callbackFunctions[id];
    }
    Notify(...args: any[]) {
        for (let name in this.callbackFunctions) {
            this.callbackFunctions[name](args);
        }
    }
}