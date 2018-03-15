import { SwarmItem } from "SwarmObjects/SwarmObject";
import { SwarmCreator } from "SwarmObjects/SwarmCreator";
import { profile } from "Tools/Profiler";

@profile
export abstract class SwarmManager<T extends StorageMemoryType, U extends PrimarySwarmTypes>
    implements SwarmController<T, U> {
    constructor() { this.LoadSwarmObjects(); }
    get StorageType() { return this.getStorageType(); }

    protected get SwarmObjects() { return this.swarmObjects; }
    private swarmObjects!: { [itemID: string]: U };

    PrepareTheSwarm(): void {
        for (const swarmName in this.swarmObjects) {
            this.OnPrepareSwarm(this.swarmObjects[swarmName])
            this.swarmObjects[swarmName].StartTick();
        }
    }
    ActivateSwarm(): void {
        for (let swarmName in this.swarmObjects) {
            this.OnActivateSwarm(this.swarmObjects[swarmName]);
            this.swarmObjects[swarmName].ProcessTick();
        }
    }
    FinalizeSwarmActivity(): void {
        for (let swarmName in this.swarmObjects) {
            this.swarmObjects[swarmName].EndTick();
            this.OnFinalizeSwarm(this.swarmObjects[swarmName]);
            Swarmlord.ReleaseMemory(this.swarmObjects[swarmName].memory, true);
        }
    }

    private LoadSwarmObjects() {
        let allObjects = this.FindAllGameObjects();
        let allSwarmEntries = Swarmlord.GetMemoryEntries(this.getStorageType());
        let swarmObjects = {};
        for (let i = 0; i < allSwarmEntries.length; i++) {
            let obj = allObjects[allSwarmEntries[i]];
            if (!obj) {
                Swarmlord.DeleteMemory(Swarmlord.CheckoutMemory(allSwarmEntries[i], this.getManagerSavePath(), this.getStorageType()));
                continue;
            }
            delete allObjects[allSwarmEntries[i]];
            let swarmObj = this.CreateSwarmObject(obj);
            swarmObj.memory = Swarmlord.CheckoutMemory(swarmObj.saveID, this.getManagerSavePath(), this.getStorageType());
            swarmObjects[allSwarmEntries[i]] = swarmObj;
        }

        // Anything left in this object is new and needs to be added
        for (let objID in allObjects) {
            debugger;
            let swarmObj = this.CreateSwarmObject(allObjects[objID]);
            swarmObj.memory = Swarmlord.CheckoutMemory<T, IStorageMemory<U>>(objID, this.getManagerSavePath(), this.getStorageType());
            swarmObjects[objID] = swarmObj;
        }

        this.swarmObjects = swarmObjects;
    }

    protected CreateSwarmObject(obj: any): PrimarySwarmTypes {
        return SwarmCreator.CreateSwarmObject(obj, this.getSwarmType(obj)) as PrimarySwarmTypes;
    }
    protected abstract getManagerSavePath(): string[];
    protected abstract getSwarmType(obj: any): SwarmType;
    protected abstract getStorageType(): T;
    protected abstract FindAllGameObjects(): { [id: string]: any }
    protected abstract OnPrepareSwarm(swarmObj: U): void;
    protected abstract OnActivateSwarm(swarmObj: U): void;
    protected abstract OnFinalizeSwarm(swarmObj: U): void;
    InitSwarmManager(): void {
        /*let allGameObjects = this.FindAllGameObjects();
        for (let objID in allGameObjects) {
            let obj = allGameObjects[objID];
            Swarmlord.CheckoutMemory<T, IStorageMemory<U>>(objID, this.getManagerSavePath(), this.getStorageType());
        }
        this.FinalizeSwarmActivity();*/
    }
}