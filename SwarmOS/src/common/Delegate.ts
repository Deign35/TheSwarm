export class Delegate {
    constructor(private callbackType: any, private callbackId: string, private callbackFunction: string) {

    }
}

let delFunction = function fn(x: () => void) {
    console.log('boop');
}
// Delegate and callback...need to have both somehow.

export class FrameDelegate extends Delegate {
    private handlers = new Array();
    subscribe(fn: any) {
        this.handlers.push(fn);
    }
    unsubscribe(fn: any) {
        this.handlers = this.handlers.filter((handle) => handle != fn);
    }
    //(TODO) Error handling required
    fire(o: any, thisObj: Delegate) {
        this.handlers.forEach((item)=> {
            item.call(thisObj, o);
        });
    }

}

export class Del<T> {

}