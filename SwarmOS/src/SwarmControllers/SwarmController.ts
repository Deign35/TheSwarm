import { profile } from "Tools/Profiler";
import { MemoryNotFoundException } from "Tools/SwarmExceptions";
import { MasterSwarmMemory } from "SwarmMemory/StorageMemory";

const SWARMOBJECT_IDs = 'IDs';
@profile
export abstract class SwarmController<T extends SwarmControllerDataTypes,
    U extends SwarmObject> implements ISwarmObjectController<T, U> {
    constructor() {
        this.LoadSwarmObjects();
    }

    get DataType(): T { return this._dataType; }

    protected get SwarmMemory() { return this.swarmObjects; }
    protected swarmObjects!: { [itemID: string]: U };
    protected _primaryMemory!: TMasterMemory;

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
            this._primaryMemory.SaveChildMemory(obj.GetCopyOfMemory().ReleaseMemory());
        }
        Swarmlord.SaveMasterMemory(this._primaryMemory, true);
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

        let allSwarmEntries = Object.keys(this._primaryMemory.GetData<TSwarmMemory>("ChildData"));
        let swarmObjects = {};
        for (let i = 0; i < allSwarmEntries.length; i++) {
            let obj = allObjects[allSwarmEntries[i]];
            if (!obj) {
                this._primaryMemory.RemoveData(allSwarmEntries[i]);
                continue;
            }
            let swarmMem = this._primaryMemory.CheckoutChildMemory(allSwarmEntries[i]);
            let swarmObj = SwarmCreator.CreateSwarmObject(swarmMem.GetData<SwarmType>('SWARM_TYPE'));
            swarmObj.AssignObject(allObjects[allSwarmEntries[i]], swarmMem);
            swarmObjects[allSwarmEntries[i]] = swarmObj;
            delete allObjects[allSwarmEntries[i]];
        }

        // Anything left in this object is new and needs to be added
        for (let objID in allObjects) {
            let swarmMem = SwarmCreator.CreateNewSwarmMemory(objID, this.GetSwarmTypeFromObject(allObjects[objID]));

            swarmMem.ReserveMemory();
            let newSwarmObj = SwarmCreator.CreateSwarmObject(swarmMem.GetData('SWARM_TYPE'));
            newSwarmObj.AssignObject(allObjects[objID], swarmMem);
            this.InitNewObj(newSwarmObj as U);
            swarmObjects[objID] = newSwarmObj;
        }

        this.swarmObjects = swarmObjects;
    }
    protected abstract InitNewObj(swarmObj: U): void;

    protected abstract GetTypeOf(obj: AnyStructure | Creep | Flag | Room | RoomObject): SwarmType;
    protected abstract get _dataType(): T;

}