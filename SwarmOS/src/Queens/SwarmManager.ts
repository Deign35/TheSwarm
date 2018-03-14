import { SwarmItem } from "SwarmObjects/SwarmObject";

export abstract class SwarmManager<T extends StorageMemoryType, U, V extends SwarmType> implements ISC_SwarmController<T, U> {
    get StorageType() { return this.getStorageType(); }
    protected get SwarmObjects(): { [itemID: string]: SwarmItem<U, V> } {
        return this.swarmObjects;
    }

    private swarmObjects!: { [itemID: string]: SwarmItem<U, V> };
    PrepareTheSwarm(): void {
        this.swarmObjects = {};
        for (const swarmName in Swarmlord.GetMemoryEntries(this.StorageType)) {
            if (!Game.rooms[swarmName]) {
                // Room is no longer in view.  Need to figure out what this means.
            }
        }
        let allGameObjects = this.findAllGameObjects();
        for (const swarmName in allGameObjects) {
            this.swarmObjects[swarmName] = this.CreateSwarmObject(allGameObjects[swarmName]);
            this.swarmObjects[swarmName].StartTick();
        }
    }
    ActivateSwarm(): void {
        throw new Error("Method not implemented.");
    }
    FinalizeSwarmActivity(): void {
        throw new Error("Method not implemented.");
    }
    CreateSwarmObject(obj: U): SwarmItem<U, V> {
        throw new Error("Method not implemented.");
    }

    protected abstract findAllGameObjects(): { [id: string]: U }
    protected abstract getStorageType(): T;
}