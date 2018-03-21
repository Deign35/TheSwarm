import { profile } from "Tools/Profiler";
import { MemoryNotFoundException } from "Tools/SwarmExceptions";
import { SwarmCreator } from "SwarmTypes/SwarmCreator";
import { MasterSwarmMemory } from "Memory/StorageMemory";

const SWARMOBJECT_IDs = 'IDs';
@profile
export abstract class SwarmManager<T extends SwarmControllerDataTypes, U extends SwarmType,
    V extends SwarmDataType, X extends Room | RoomObject> implements ISwarmObjectController<T, U, V, X> {
    constructor() {
        this.LoadSwarmObjects();
    }

    get DataType(): T { return this._dataType; }

    protected get SwarmMemory() { return this.swarmObjects; }
    protected swarmObjects!: { [itemID: string]: ISwarmObject<U, V, X> };
    protected _primaryMemory!: IMasterSwarmMemory<U>;

    PrepareTheSwarm(): void {
        for (const swarmName in this.swarmObjects) {
            this.OnPrepareSwarm(this.swarmObjects[swarmName])
        }
    }
    ActivateSwarm(): void {
        for (let swarmName in this.swarmObjects) {
            this.OnActivateSwarm(this.swarmObjects[swarmName]);
        }
    }
    FinalizeSwarmActivity(): void {
        for (let swarmName in this.swarmObjects) {
            let obj = this.swarmObjects[swarmName];
            this.OnFinalizeSwarm(obj);
            this._primaryMemory.SaveChildMemory(obj.GetMemoryObject());
        }
        Swarmlord.SaveMemory(this._primaryMemory);
    }


    GetSwarmObject(id: string): ISwarmObject<U, V, X> {
        return this.swarmObjects[id];
    }

    GetSwarmTypeFromObject(obj: X): U {
        return this.GetTypeOf(obj);
    }
    protected CreateSwarmObject(obj: X, swarmType: U): ISwarmObject<U, V, X> {
        return SwarmCreator.CreateSwarmObject(obj, swarmType);
    }
    protected abstract FindAllGameObjects(): IDictionary<X>
    protected abstract OnPrepareSwarm(swarmObj: ISwarmObject<U, V, X>): void;
    protected abstract OnActivateSwarm(swarmObj: ISwarmObject<U, V, X>): void;
    protected abstract OnFinalizeSwarm(swarmObj: ISwarmObject<U, V, X>): void;
    protected LoadSwarmObjects(): any {
        let allObjects = this.FindAllGameObjects();
        this._primaryMemory = Swarmlord.CheckoutMasterMemory(this.DataType);

        let allSwarmEntries = this._primaryMemory.GetIDs();
        let swarmObjects = {};
        for (let i = 0; i < allSwarmEntries.length; i++) {
            let obj = allObjects[allSwarmEntries[i]];
            if (!obj) {
                this._primaryMemory.RemoveData(allSwarmEntries[i]);
                continue;
            }
            delete allObjects[allSwarmEntries[i]];
            let swarmObj = this.CreateSwarmObject(obj, this.GetSwarmTypeFromObject(obj));
            swarmObj.AssignMemory(this._primaryMemory.CheckoutChildMemory(swarmObj.saveID));
            swarmObjects[allSwarmEntries[i]] = swarmObj;
        }

        // Anything left in this object is new and needs to be added
        for (let objID in allObjects) {
            let swarmObj = this.CreateSwarmObject(allObjects[objID], this.GetSwarmTypeFromObject(allObjects[objID]));
            this._primaryMemory.CreateNewChildMemory(objID);
            swarmObj.AssignMemory(this._primaryMemory.CheckoutChildMemory(objID));
            swarmObj.InitNewObject();
            swarmObjects[objID] = swarmObj;
        }

        this.swarmObjects = swarmObjects;
    }
    protected abstract GetTypeOf(obj: X): U;

    protected abstract get _dataType(): T;
}

export abstract class PrimeManager<T extends PrimeDataTypes, U extends SwarmType,
    V extends SwarmDataType, X extends Room | RoomObject> extends SwarmManager<T, U, V, X> {
}