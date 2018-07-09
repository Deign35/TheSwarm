declare interface PQueueItem {

}

class PQINode<T extends PQueueItem> {
    constructor(private _item: T, private _index: number) { }
    get Item() { return this._item; }
    get index() { return this._index; }
    set index(newIndex) { this._index = newIndex };

    get left() { return this.index * 2 + 1; }
    get right() { return this.left + 1; }
}

const NULL_NODE = new PQINode<any>('NULL', -1);

declare type PQI_Compare<T extends PQueueItem> = (itemA: T, itemB: T) => number;
export abstract class PriorityQueue<T extends PQueueItem> {
    constructor(private _comparators: PQI_Compare<T>[]) {
        this._queueBacking = [];
        this.SetComparators();
    }
    private _queueBacking: PQINode<T>[];

    abstract SetComparators(): void;
    get Count() {
        return this._queueBacking.length;
    }

    Peek() {
        return (this._queueBacking.length > 0 && this._queueBacking[0].Item) || undefined;
    }
    Pop() {
        if (this.Count == 0) { return undefined; }
        let next = this._queueBacking[0];
        while (this.Count > 0) {
            let replacement = this._queueBacking.pop()!;
            if (replacement === NULL_NODE) {
                continue;
            }

            this.insertAt(replacement, 0);
            break;
        }

        return next.Item;
    }
    Push(item: T) {
        this.insertAt(new PQINode<T>(item, 0), 0);
    }
    private compareItems(itemA: PQINode<T>, itemB: PQINode<T>) {
        if (itemA === NULL_NODE) {
            return 1;
        }
        if (itemB === NULL_NODE) {
            return -1;
        }
        for (let i = 0; i < this._comparators.length; i++) {
            let compare = this._comparators[i](itemA.Item, itemB.Item);
            if (compare != 0) {
                return compare;
            }
        }

        return 0;
    }
    private getIndex(index: number): PQINode<T> | undefined {
        return (this._queueBacking.length > index && this._queueBacking[index]) || undefined;
    }
    private insertAt(node: PQINode<T>, index: number) {
        if (index < 0 || index >= this._queueBacking.length) {
            if (index == this._queueBacking.length) {
                this._queueBacking.push(node);
            }
            if (index == this._queueBacking.length + 1) {
                this._queueBacking.push(NULL_NODE);
                this._queueBacking.push(node);
            }
            return;
        }

        let curNode = this.getIndex(index)!;
        if (curNode === NULL_NODE) {
            node.index = index;
            this._queueBacking[index] = node;
            return;
        }

        let nextNode = node;
        let compareResult = this.compareItems(node, curNode);
        if (compareResult == -1) {
            node.index = index;
            this._queueBacking[index] = node;
            nextNode = curNode;
            curNode = node;
        }

        if (this._queueBacking.length <= curNode.left) {
            while (this._queueBacking.length < curNode.left) {
                this._queueBacking.push(NULL_NODE);
            }

            this._queueBacking.push(node);
            return;
        } else if (this._queueBacking.length == curNode.right) {
            this._queueBacking.push(node);
            return;
        }

        // Need to determine which direction to go...

        let nextIndex = curNode.left;
        this.insertAt(nextNode, nextIndex);
    }

    Serialize() {
        let dataArray = [];
        for (let i = 0; i < this._queueBacking.length; i++) {
            dataArray.push(this._queueBacking[i]);
        }

        return dataArray;
    }
    Deserialize(serialized: T[]) {
        for (let i = 0, length = serialized.length; i < length; i++) {
            this._queueBacking.push(new PQINode(serialized[i], i));
        }
    }
}