import { profile } from "Tools/Profiler";
import { MemoryNotFoundException } from "Tools/SwarmExceptions";
import { BasicMemory } from "Memory/StorageMemory";

const SWARMOBJECT_IDs = 'IDs';
@profile
export abstract class SwarmManager<U extends TSwarmObjectTypes>
    implements SwarmController<U> {
    constructor() { this.LoadSwarmObjects(); }
    get StorageType() { return this.getStorageType(); }

    protected get SwarmObjects() { return this.swarmObjects; }
    private swarmObjects!: { [itemID: string]: U };
    private _primaryMemory!: BasicMemory;

    PrepareTheSwarm(): void {
        for (const swarmName in this.swarmObjects) {
            this.OnPrepareSwarm(this.swarmObjects[swarmName])
        }
    }
    ActivateSwarm(): void {
        for (let swarmName in this.swarmObjects) {
            this.OnActivateSwarm(this.swarmObjects[swarmName]);
            this.swarmObjects[swarmName].Activate();
        }
    }
    FinalizeSwarmActivity(): void {
        debugger;
        for (let swarmName in this.swarmObjects) {
            let obj = this.swarmObjects[swarmName];
            this.OnFinalizeSwarm(obj);
            this._primaryMemory.SaveChildMemory(obj.GetMemoryObject());
            //Swarmlord.ReleaseMemory(this.swarmObjects[swarmName].memory, true);
        }
        Swarmlord.ReleaseMemory2(this._primaryMemory, true);
    }
    GetSwarmObject(id: string) {
        return this.swarmObjects[id];
    }

    private LoadSwarmObjects() {
        let allObjects = this.FindAllGameObjects();
        this._primaryMemory = Swarmlord.CheckoutMemory(Swarmlord.StorageMemoryTypeToString(this.getStorageType()), this.getStorageType()) as BasicMemory;
        let allSwarmEntries = this._primaryMemory.GetIDs();
        let swarmObjects = {};
        for (let i = 0; i < allSwarmEntries.length; i++) {
            let obj = allObjects[allSwarmEntries[i]];
            if (!obj) {
                this._primaryMemory.RemoveData(allSwarmEntries[i]);
                continue;
            }
            delete allObjects[allSwarmEntries[i]];
            let swarmObj = this.CreateSwarmObject(obj);
            swarmObj.AssignMemory(Swarmlord.CheckoutMemory(swarmObj.saveID, this.getStorageType(), this._primaryMemory));
            swarmObjects[allSwarmEntries[i]] = swarmObj;
        }

        // Anything left in this object is new and needs to be added
        for (let objID in allObjects) {
            let swarmObj = this.CreateSwarmObject(allObjects[objID]);
            Swarmlord.CreateNewStorageMemory(objID, StorageMemoryType.RoomObject, this._primaryMemory);
            swarmObj.AssignMemory(Swarmlord.CheckoutMemory(objID, this.getStorageType(), this._primaryMemory));
            swarmObj.InitNewObject();
            swarmObjects[objID] = swarmObj;
        }

        this.swarmObjects = swarmObjects;
    }

    protected CreateSwarmObject(obj: any) {
        return SwarmCreator.CreateSwarmObject(obj, this.getSwarmType(obj));
    }
    protected abstract getManagerSavePath(): string[];
    protected abstract getSwarmType(obj: any): SwarmType;
    protected abstract getStorageType(): StorageMemoryType;
    protected abstract FindAllGameObjects(): {
        [id: string]: Source | Creep
        | Mineral | Resource | Room | Flag
        | ConstructionSite | Nuke | Tombstone | Structure
    }
    protected abstract OnPrepareSwarm(swarmObj: U): void;
    protected abstract OnActivateSwarm(swarmObj: U): void;
    protected abstract OnFinalizeSwarm(swarmObj: U): void;
}