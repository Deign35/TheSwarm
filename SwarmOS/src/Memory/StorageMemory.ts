export abstract class StorageMemory implements IStorageMemory {
    GetData<T>(id: string): T {
        throw new Error("Method not implemented.");
    }
    SetData<T>(id: string, data: T): void {
        throw new Error("Method not implemented.");
    }
    RemoveData(id: string): void {
        throw new Error("Method not implemented.");
    }
}