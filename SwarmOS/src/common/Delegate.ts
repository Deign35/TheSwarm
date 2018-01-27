export class Delegate<T extends CallbackFunction> {
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