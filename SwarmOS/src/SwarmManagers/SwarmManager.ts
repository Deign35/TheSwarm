import { profile } from "Tools/Profiler";
import { MemoryNotFoundException } from "Tools/SwarmExceptions";
import { SwarmCreator } from "SwarmTypes/SwarmCreator";
import { MasterSwarmMemory } from "Memory/StorageMemory";

const SWARMOBJECT_IDs = 'IDs';
@profile
export abstract class SwarmManager<T extends SwarmControllerDataTypes, U extends SwarmType>
    implements ISwarmObjectController<T, U> {
    get DataType(): T { return this._dataType; }
    constructor() { this.LoadSwarmObjects(); }

    protected get SwarmMemory() { return this.swarmObjects; }
    protected swarmObjects!: { [itemID: string]: ISwarmType<U, any, any> };
    protected _primaryMemory!: MasterSwarmMemory<U>;

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
            //obj.GetMemoryObject();

            this._primaryMemory.SaveChildMemory(obj.GetMemoryObject());
        }
        //Swarmlord.SaveMemory(this._primaryMemory);
    }
    GetSwarmObject<V extends SwarmDataType, X extends Room | RoomObject>(id: string): ISwarmType<U, V, X> {
        return this.swarmObjects[id];
    }



    protected CreateSwarmObject(obj: any) {
        return SwarmCreator.CreateSwarmObject(obj);
    }
    protected abstract FindAllGameObjects(): IDictionary<Room | RoomObject>
    protected abstract OnPrepareSwarm(swarmObj: ISwarmType<U, any, any>): void;
    protected abstract OnActivateSwarm(swarmObj: ISwarmType<U, any, any>): void;
    protected abstract OnFinalizeSwarm(swarmObj: ISwarmType<U, any, any>): void;
    protected abstract LoadSwarmObjects(): any;

    protected abstract get _dataType(): T;
}

export abstract class PrimeManager<T extends PrimeDataTypes, U extends SwarmType> extends SwarmManager<T, U> {
    protected LoadSwarmObjects() {
        let allObjects = this.FindAllGameObjects();
        Swarmlord.CheckoutMasterMemory(this.DataType);
        this._primaryMemory = Swarmlord.CheckoutMasterMemory(this._dataType);

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
            swarmObj.AssignMemory(this._primaryMemory.CheckoutChildMemory(swarmObj.saveID));
            swarmObjects[allSwarmEntries[i]] = swarmObj;
        }

        // Anything left in this object is new and needs to be added
        for (let objID in allObjects) {
            let swarmObj = this.CreateSwarmObject(allObjects[objID]);
            this._primaryMemory.CreateNewChildMemory(objID);
            swarmObj.AssignMemory(this._primaryMemory.CheckoutChildMemory(objID));
            swarmObj.InitNewObject();
            swarmObjects[objID] = swarmObj;
        }

        this.swarmObjects = swarmObjects;
    }
}