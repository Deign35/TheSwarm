declare type PQI_Compare<T> = (itemA: T, itemB: T) => number;
export class BiTree<T> {
    constructor(private _item: T, private _comparators: PQI_Compare<T>[], private _next?: BiTree<T>) { }
    get Item() { return this._item; }

    private _children: BiTree<T>[] = [];
    get Children() { return this._children; }

    Peek() { return this._item }
    Pop() {
        if (!this._item) { return undefined; }
        let returnVal = this._item;
        for (let i = 0; i < this._children.length; i++) {
            this._children[i]._next = this._next;
            this._children[i].merge();
        }
        return returnVal;
    }
    Push(item: T) {
        let newTree = new BiTree(item, this._comparators, this);
        newTree.merge();
    }

    private merge() {
        if (!this._next) {
            return;
        }

        if (this.compareItems(this._item, this._next._item) > 0) {
            let old = this._item;
            this._item = this._next._item;
            this._item = old;
        }
        if (this.Children.length > this._next.Children.length) {
            let consumed = this._next;
            this._next._children = this._children;
            this._children = consumed._children;
        }

        if (!this._next._next) {
            return;
        }

        if (this.Children.length != this._next.Children.length) {
            this._next.merge();
        } else {
            if (this._next._next.Children.length == this.Children.length) {
                this._next.merge();
            } else {
                let consumed = this._next;
                this._next = this._next._next;
                if (this._children.length == 0) {
                    consumed._next = undefined;
                } else {
                    consumed._next = this._children[0];
                }
                this._children.push(consumed);
                this._children[0].merge();
            }
        }
    }

    private compareItems(itemA: T, itemB: T) {
        for (let i = 0; i < this._comparators.length; i++) {
            let compare = this._comparators[i](itemA, itemB);
            if (compare != 0) {
                return compare;
            }
        }

        return 0;
    }
}