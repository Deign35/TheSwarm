import { SwarmItemWithName } from "SwarmObjects/SwarmObject";
import { profile } from "Tools/Profiler";
import { MemoryNotFoundException } from "Tools/SwarmExceptions";

const SWARMOBJECT_IDs = 'IDs';
@profile
export abstract class SwarmManager<U extends TSwarmObjectTypes>
    implements SwarmController<U> {
    constructor() { this.LoadSwarmObjects(); }
    get StorageType() { return this.getStorageType(); }

    protected get SwarmObjects() { return this.swarmObjects; }
    private swarmObjects!: { [itemID: string]: U };

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
        for (let swarmName in this.swarmObjects) {
            this.OnFinalizeSwarm(this.swarmObjects[swarmName]);
            Swarmlord.ReleaseMemory(this.swarmObjects[swarmName].GetMemoryObject(), true);
        }
    }
    GetSwarmObject(id: string) {
        return this.swarmObjects[id];
    }

    private LoadSwarmObjects() {
        let allObjects = this.FindAllGameObjects();
        let managerPath = this.getManagerSavePath();

        let managerMem = Swarmlord.CheckoutMemory(managerPath.slice(-1)[0], managerPath.slice(0, -1), this.getStorageType());
        let memIDs = managerMem.GetIDs();
        Swarmlord.ReleaseMemory(managerMem, true);

        let swarmObjects = {};
        for (let i = 0; i < memIDs.length; i++) {
            let obj = allObjects[memIDs[i]];
            if (!obj) {
                Swarmlord.DeleteMemory(Swarmlord.CheckoutMemory(memIDs[i], managerPath, this.getStorageType()));
                continue;
            }
            delete allObjects[memIDs[i]];
            let swarmObj = this.CreateSwarmObject(obj);
            swarmObjects[swarmObj.saveID] = swarmObj;
        }

        // Anything left in this object is new and needs to be added
        for (let objID in allObjects) {
            let swarmObj = this.CreateSwarmObject(allObjects[objID]);
            swarmObjects[swarmObj.saveID] = swarmObj;
        }

        this.swarmObjects = swarmObjects;
    }

    protected CreateSwarmObject(obj: any) {
        return SwarmCreator.CreateSwarmObject(obj, this.getSwarmType(obj), this.getManagerSavePath());
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