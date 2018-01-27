export class Callback {
    private handlers = new Array();
    subscribe(fn: any) {
        this.handlers.push(fn);
    }
    unsubscribe(fn: any) {
        this.handlers = this.handlers.filter((handle) => handle != fn);
    }
    //(TODO) Error handling required
    fire(o: any, thisObj: Callback) {
        this.handlers.forEach((item)=> {
            item.call(thisObj, o);
        });
    }
}