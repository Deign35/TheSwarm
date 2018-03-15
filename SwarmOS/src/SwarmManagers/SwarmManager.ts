import { SwarmItem } from "SwarmObjects/SwarmObject";
import { SwarmCreator } from "SwarmObjects/SwarmCreator";

export abstract class SwarmManager<T extends StorageMemoryType, U extends PrimarySwarmTypes> implements SwarmController<T, U> {
    get StorageType() { return this.getStorageType(); }
    protected get SwarmObjects(): { [itemID: string]: U } {
        return this.swarmObjects;
    }

    private swarmObjects!: { [itemID: string]: U };
    PrepareTheSwarm(): void {
        let allGameObjects = this.findAllGameObjects();
        for (const swarmName in allGameObjects) {
            this.swarmObjects[swarmName] = this.CreateSwarmObject(allGameObjects[swarmName]);
            this.swarmObjects[swarmName].StartTick();
        }
    }
    ActivateSwarm(): void {
        for (let swarmName in this.swarmObjects) {
            this.swarmObjects[swarmName].ProcessTick();
        }
    }
    FinalizeSwarmActivity(): void {
        for (let swarmName in this.swarmObjects) {
            this.swarmObjects[swarmName].EndTick();
        }
    }
    protected abstract CreateSwarmObject(obj: U): U;
    protected abstract getSwarmType(obj: any): SwarmType;
    protected abstract findAllGameObjects(): { [id: string]: U }
    protected abstract getStorageType(): T;
}