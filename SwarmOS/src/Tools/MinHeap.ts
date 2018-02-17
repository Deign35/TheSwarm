const REBALANCE_CONSTANT = 3;
export class MinHeap<T> {
    protected headNode?: Node<T>;
    Pop(): T | undefined {
        if (!this.headNode) { return undefined; }
        let poppedValue = this.headNode;
        let leftWeight = poppedValue.left ? poppedValue.left.weight : -1;
        let rightWeight = poppedValue.right ? poppedValue.right.weight : -1;

        if (leftWeight < rightWeight) {
            // Use left side
        } else {
            // Use right side
        }

        this.RebalanceBranch(this.headNode);
        return poppedValue.obj;
    }
    protected BubbleUp(headNode: Node<T>): Node<T> | undefined {
        let prevHead = headNode;
        let replacement: Node<T> | undefined;
        if (headNode.left && headNode.right) {
            if (headNode.left.weight < headNode.right.weight) {
                // Use left side
                replacement = this.BubbleUp(headNode.left);
            } else {
                // Use right side
                replacement = this.BubbleUp(headNode.right);
            }
        } else if (headNode.left) {
            replacement = headNode.left;
        }
        // I don't think this is complete...
        if (replacement === undefined) {
            return;
        }
        this.CopyNodeValue(replacement, headNode);

        return prevHead;
    }
    Push(obj: T, weight: number) {
        let node: Node<T> = { obj: obj, weight: weight, depth: -1 };
        if (!this.headNode) { this.headNode = node; return; }
        this.headNode = this.Insert(this.headNode, node);

        let leftChild = this.headNode.left;
        let rightChild = this.headNode.right;
        this.GetDepth(leftChild, false);
        this.GetDepth(rightChild, false);
        let leftDepth = leftChild ? leftChild.depth : 0;
        let rightDepth = rightChild ? rightChild.depth : 0;
        if (false) {
            //this.RebalanceBranch(this.headNode);
        }
    }
    protected Insert(headNode: Node<T>, newObj: Node<T>): Node<T> {
        let leftChild = headNode.left;
        let rightChild = headNode.right;

        if (newObj.weight < headNode.weight) {
            newObj.parent = headNode.parent;
            headNode.parent = newObj;

            if (leftChild && rightChild) {
                this.GetDepth(leftChild, false);
                this.GetDepth(rightChild, false);

                if (leftChild.depth < rightChild.depth) {
                    newObj.left = headNode;
                    newObj.right = rightChild;
                    rightChild.parent = newObj;
                    headNode.right = undefined;
                } else {
                    newObj.right = headNode;
                    newObj.left = leftChild;
                    leftChild.parent = newObj;
                    headNode.left = undefined;
                }
                this.RebalanceBranch(headNode);
            } else if (leftChild) {
                // balance to the right
                newObj.left = headNode;
                headNode.depth++;
                newObj.right = leftChild;
                headNode.left = undefined;
            } else {
                // put it on the left by default
                newObj.left = headNode;
                headNode.depth++;
            }

            return newObj;
        } else {
            if (leftChild && rightChild) {
                this.GetDepth(leftChild, false);
                this.GetDepth(rightChild, false);

                if (leftChild.depth < rightChild.depth) {
                    this.Insert(leftChild, newObj);
                } else {
                    this.Insert(rightChild, newObj);
                }
            } else if (leftChild) {
                headNode.right = newObj;
            } else {
                headNode.left = newObj;
            }
        }

        return headNode;
    }

    protected RebalanceBranch(headNode: Node<T>) {
        let leftChild = headNode.left;
        let rightChild = headNode.right;

        this.GetDepth(leftChild, true);
        this.GetDepth(rightChild, true);

        let leftDepth = leftChild ? leftChild.depth : -1;
        let rightDepth = rightChild ? rightChild.depth : -1;

        if (Math.abs(leftDepth - rightDepth) * REBALANCE_CONSTANT > leftDepth + rightDepth) {
            return;
        }
    }

    protected GetDepth(headNode: Node<T> | undefined, reset: boolean) {
        if (!headNode) { return; }
        if (headNode.depth >= 0 && !reset) { return }

        let leftDepth: number = 0;
        if (headNode.left) {
            this.GetDepth(headNode.left, true);
            leftDepth = headNode.left.depth as number;
        }
        let rightDepth: number = 0;
        if (headNode.right) {
            this.GetDepth(headNode.right, true);
            rightDepth = headNode.right.depth as number;
        }

        headNode.depth = Math.max(leftDepth, rightDepth) + 1;
    }

    // This leaves me a little nervous 
    CopyNodeValue(from: Node<T>, to: Node<T>) {
        to.weight = from.weight;
        to.depth = from.depth;
    }
}

type Node<T> = {
    obj: T,
    weight: number,
    depth: number,
    parent?: Node<T>,
    left?: Node<T>,
    right?: Node<T>,
}