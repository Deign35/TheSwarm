import * as _ from "lodash"; // Compiler: IgnoreLine

const REBALANCE_CONSTANT = 3;
export class MinHeap<T> {
    protected headNode?: Node<T>;

    Push(obj: T, weight: number) {
        let node: Node<T> = { obj: obj, weight: weight, depth: -1, childCount: 0 };
        if (!this.headNode) { // first node.
            this.headNode = node;
            this.headNode.depth = 1;
            return;
        }
        this.Insert(this.headNode, node);
        this.RebalanceBranch(this.headNode);
    }

    protected Insert(headNode: Node<T>, newObj: Node<T>) {
        if (!headNode || !newObj) { return; }
        if (newObj.weight < headNode.weight) { // replace the headnode with newObj and then reinsert the old one.
            let oldHead = this.createTempNode(headNode);
            this.CopyNodeValue(newObj, headNode);
            this.CopyNodeValue(oldHead, newObj);
        }
        if (headNode.left && headNode.right) {
            if (headNode.left.depth < headNode.right.depth) { // Try to keep it as balanced as we can
                this.Insert(headNode.left, newObj);
            } else {
                this.Insert(headNode.right, newObj);
            }
            headNode.depth = Math.max(headNode.left.depth, headNode.right.depth) + 1;
            headNode.childCount = headNode.left.childCount + headNode.right.childCount + 2;
        } else if (headNode.left) { // right side is empty
            newObj.parent = headNode;
            newObj.depth = 1;
            headNode.right = newObj;
            headNode.depth = headNode.left.depth + 1;
            headNode.childCount = headNode.left.childCount + 2;
        } else { // left side is empty
            newObj.parent = headNode;
            newObj.depth = 1;
            headNode.left = newObj;
            headNode.depth = 2;
            headNode.childCount = 1;
        }
    }

    Peek(): T | undefined {
        if (!this.headNode) { return undefined; }
        return this.headNode.obj;
    }
    PeekDeep(maxDepth: number): T[] {
        return this.DeepPeek(maxDepth, this.headNode);
    }
    protected DeepPeek(maxDepth: number, headNode?: Node<T>): T[] {
        if (!headNode || headNode.depth > maxDepth) return [];
        return _.union([headNode.obj], this.DeepPeek(maxDepth, headNode.left), this.DeepPeek(maxDepth, headNode.right));
    }

    Pop(): T | undefined {
        if (!this.headNode) { return undefined; }
        let retVal = this.headNode.obj;
        this.BubbleUp(this.headNode);
        if (this.headNode) {
            this.RebalanceBranch(this.headNode);
        }
        return retVal;
    }

    protected BubbleUp(headNode: Node<T>) {
        if (!headNode) { return; }
        headNode.childCount--; // This should be good enough right?
        // headNode is considered dead atm, need to replace with next in line.
        if (headNode.left && headNode.right) {
            if (headNode.left.weight < headNode.right.weight) { // Use left side
                this.CopyNodeValue(headNode.left, headNode);
                this.BubbleUp(headNode.left);
            } else { // Use right side
                this.CopyNodeValue(headNode.right, headNode);
                this.BubbleUp(headNode.right);
            }

            // bubble up could replace the child node to undefined, check it again.
            let leftDepth = headNode.left ? headNode.left.depth : 0;
            let rightDepth = headNode.right ? headNode.right.depth : 0;
            headNode.depth = Math.max(leftDepth, rightDepth) + 1;
        } else if (headNode.left) {
            this.CopyNodeValue(headNode.left, headNode);
            this.BubbleUp(headNode.left); // just in case...not sure if this is necessary yet.
            headNode.depth = (headNode.left ? headNode.left.depth : 0) + 1;
        } else if (headNode.right) {
            this.CopyNodeValue(headNode.right, headNode);
            this.BubbleUp(headNode.right);
            headNode.depth = (headNode.right ? headNode.right.depth : 0) + 1;
        } else { // nothing can replace this node, so replace it with undefined in the parent.
            if (headNode.parent === undefined) { // This is the head node.
                this.headNode = undefined;
            } else {
                if (headNode.parent.left && headNode.parent.left === headNode) { // headNode is on the left
                    headNode.parent.left = undefined;
                    headNode.parent.depth = headNode.parent.right ? headNode.parent.right.depth + 1 : 1;
                } else if (headNode.parent.right && headNode.parent.right === headNode) { // headNode is on the right
                    headNode.parent.right = undefined;
                    headNode.parent.depth = headNode.parent.left ? headNode.parent.left.depth + 1 : 1;
                }
            }
        }
    }

    protected RebalanceBranch(headNode: Node<T>) {
        // Will only get called once per operation.  This means the tree may not be as balanced
        // as it could be, but I also won't spend much cpu balancing the tree.
        if (headNode.depth - Math.log2(headNode.childCount) > REBALANCE_CONSTANT) { // Unbalanced tree.
            let balanceLeft = false;
            if (headNode.left && headNode.right) {
                if (headNode.left.depth < headNode.right.depth) {
                    balanceLeft = true;
                }
            } else if (headNode.right) {
                balanceLeft = true;
            }

            if (balanceLeft) { // Can only be true if headNode.right is true
                let savedNode = headNode.right;
                this.BubbleUp(headNode.right as Node<T>);
                this.Insert(headNode, savedNode as Node<T>);
            } else { // Can't be here if headNode has no children, therefore, there must be a left child.
                let savedNode = headNode.left;
                this.BubbleUp(headNode.left as Node<T>);
                this.Insert(headNode, savedNode as Node<T>);
            }
        }
    }

    protected CopyNodeValue(from: Node<T>, to: Node<T>) {
        to.weight = from.weight;
        to.depth = from.depth;
        to.obj = from.obj;
    }
    protected createTempNode(from: Node<T>): Node<T> {
        let newNode: Node<T> = { weight: from.weight, obj: from.obj, childCount: 0, depth: -1 }
        return newNode;
    }

    static CompressHeap<T>(heap: MinHeap<T>, itemSerializer: ItemSerializer<T>): SerializedHeap[] {
        if (heap.headNode) {
            return this.compressNode(heap.headNode, itemSerializer);
        }

        return [];
    }
    protected static compressNode<T>(headNode: Node<T>, itemSerializer: ItemSerializer<T>): SerializedHeap[] {
        let compressedArray: SerializedHeap[] = [];
        if (headNode.left) {
            compressedArray = this.compressNode(headNode.left, itemSerializer);
        }
        compressedArray.push([itemSerializer(headNode.obj), headNode.weight]);
        if (headNode.right) {
            let rightArray = this.compressNode(headNode.right, itemSerializer);
            compressedArray = _.union(compressedArray, rightArray);
        }

        return compressedArray;
    }
    static DeserializeHeap<T>(compressedArray: SerializedHeap[], itemDeserializer: ItemDeserializer<T>): MinHeap<T> {
        let newHeap = new MinHeap<T>();
        while (compressedArray.length > 0) {
            let curItem = compressedArray.splice(0, 1)[0];
            newHeap.Push(itemDeserializer(curItem[0]), curItem[1])
        }

        return newHeap;
    }
}
declare type ItemSerializer<T> = (inVal: T) => string;
declare type ItemDeserializer<T> = (inString: string) => T;
declare type SerializedHeap = [
    string, // serialized obj
    number  // obj weight
]

type Node<T> = {
    obj: T,
    weight: number,
    depth: number,
    childCount: number,
    parent?: Node<T>,
    left?: Node<T>,
    right?: Node<T>,
}