import { profile } from "Tools/Profiler";
import { MemoryNotFoundException } from "Tools/SwarmExceptions";
import { SwarmCreator } from "SwarmTypes/SwarmCreator";
import { MasterSwarmMemory } from "Memory/StorageMemory";

const SWARMOBJECT_IDs = 'IDs';
@profile
export abstract class SwarmManager<T extends SwarmControllerDataTypes,
    U extends SwarmObject> implements ISwarmObjectController<T, U> {
    constructor() {
        this.LoadSwarmObjects();
    }

    get DataType(): T { return this._dataType; }

    protected get SwarmMemory() { return this.swarmObjects; }
    protected swarmObjects!: { [itemID: string]: U };
    protected _primaryMemory!: TMasterSwarmMemory;

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
            this._primaryMemory.SaveChildMemory(obj.GetCopyOfMemory());
        }
        Swarmlord.SaveMasterMemory(this._primaryMemory);
    }

    abstract ControllerType: T;
    GetSwarmObject(id: string): U {
        return this.swarmObjects[id];
    }

    GetSwarmTypeFromObject(obj: Room | RoomObject | AnyStructure | Creep | Flag) {
        return this.GetTypeOf(obj);
    }
    protected abstract FindAllGameObjects(): Dictionary
    protected abstract OnPrepareSwarm(swarmObj: U): void;
    protected abstract OnActivateSwarm(swarmObj: U): void;
    protected abstract OnFinalizeSwarm(swarmObj: U): void;
    protected LoadSwarmObjects(): any {
        let allObjects = this.FindAllGameObjects();
        this._primaryMemory = Swarmlord.CheckoutMasterMemory(this.DataType);

        let allSwarmEntries = this._primaryMemory.GetDataIDs();
        let swarmObjects = {};
        for (let i = 0; i < allSwarmEntries.length; i++) {
            let obj = allObjects[allSwarmEntries[i]];
            if (!obj) {
                this._primaryMemory.RemoveData(allSwarmEntries[i]);
                continue;
            }
            delete allObjects[allSwarmEntries[i]];
            let swarmObj = SwarmCreator.CreateSwarmObject(obj, this._primaryMemory[allSwarmEntries[i]]);
            swarmObjects[allSwarmEntries[i]] = swarmObj;
        }

        // Anything left in this object is new and needs to be added
        for (let objID in allObjects) {
            let swarmObj = SwarmCreator.CreateNewSwarmObject(allObjects[objID], this.GetSwarmTypeFromObject(allObjects[objID]));
            swarmObjects[objID] = swarmObj;
        }

        this.swarmObjects = swarmObjects;
    }
    protected abstract GetTypeOf(obj: AnyStructure | Creep | Flag | Room | RoomObject): SwarmType;

    protected abstract get _dataType(): T;
}

export abstract class PrimeManager<T extends PrimeDataTypes, U extends SwarmObject> extends SwarmManager<T, U> {
}