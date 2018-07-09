declare type PQI_Compare<T> = (itemA: T, itemB: T) => number;
export class PriorityQueue<T> {
    constructor(private _comparators: PQI_Compare<T>[]) { }
    private _head: BinomialTree<T> | undefined = undefined;

    Peek() { return this._head && this._head.Item }
    Pop() {
        if (!this._head) { return undefined; }
        let returnVal = this._head.Item;
        let children = this._head.Children;
        for (let i = 0; i < children.length; i++) {
            children[i].Next = this._head.Next;
            this._head = children[i];
            this._head.Merge();
        }
        return returnVal;
    }
    Push(item: T) {
        let newTree = new BinomialTree(item, this._comparators);
        newTree.Next = this._head;
        this._head = newTree;
        newTree.Merge();
    }
}

class BinomialTree<T> {
    constructor(private _item: T, private _comparators: PQI_Compare<T>[]) { }
    get Item() { return this._item; }

    private _next?: BinomialTree<T>;
    get Next() { return this._next; }
    set Next(tree: BinomialTree<T> | undefined) { this._next = tree; }

    private _children: BinomialTree<T>[] = [];
    get Children() { return this._children; }
    get Degree() { return this._children.length; }
    Merge(prev?: BinomialTree<T>) {
        if (!this.Next) {
            return;
        }

        if (this.compareItems(this._item, this.Next._item) > 0) {
            let old = this._item;
            let oldChild = this._children;

            this._item = this.Next._item;
            this._children = this.Next._children;

            this._item = old;
            this._children = oldChild;
        }

        if (!this.Next.Next) {
            return;
        }

        if (this.Degree != this.Next.Degree) {
            this.Next.Merge(this);
        } else {
            if (this.Next.Next.Degree == this.Degree) {
                this.Next.Merge(this);
            } else {
                this._children.push(this.Next);
                this.Next = this.Next.Next;
                this.Merge(prev);
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