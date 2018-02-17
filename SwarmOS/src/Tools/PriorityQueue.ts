export class PriorityQueue<T> {
    protected queue: { priority: number, obj: T }[] = [];
}