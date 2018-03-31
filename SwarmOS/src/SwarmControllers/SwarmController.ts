import { profile } from "Tools/Profiler";
import { MemoryNotFoundException } from "Tools/SwarmExceptions";
import { MasterSwarmMemory, MemoryBase, SwarmMemory } from "SwarmMemory/StorageMemory";

const SWARMOBJECT_IDs = 'IDs';
@profile
export abstract class SwarmController<T extends SwarmControllerDataTypes, U extends TSwarmObject,
V extends TBasicSwarmData> implements ISwarmObjectController<T, U> {
    constructor() {
        this.LoadSwarmObjects();
    }

    get DataType(): T { return this._dataType; }

    protected get SwarmMemory() { return this.swarmObjects; }
    protected swarmObjects!: { [itemID: string]: U };
    protected _primaryMemory!: IMasterMemory<IMasterData<V>, IMemory<V, any>>;
    FinalizeSwarmActivity(): void {
        for (let swarmName in this.swarmObjects) {
            let obj = this.swarmObjects[swarmName];
            this._primaryMemory.SaveMemory(obj.ReleaseMemory() as SwarmMemoryTypes);
        }
        Swarmlord.SaveMasterMemory(this._primaryMemory as MasterMemoryTypes, true);
    }

    abstract ControllerType: T;
    GetSwarmObject(id: string): U {
        return this.swarmObjects[id];
    }

    GetSwarmTypeFromObject(obj: Room | RoomObject | AnyStructure | Creep | Flag) {
        return this.GetTypeOf(obj);
    }
    protected abstract FindAllGameObjects(): Dictionary
    protected LoadSwarmObjects(): any {
        let allObjects = this.FindAllGameObjects();
        this._primaryMemory = Swarmlord.CheckoutMasterMemory(this.DataType);

        let allSwarmEntries = Object.keys(this._primaryMemory.GetData<TBasicSwarmData>("ChildData"));
        let swarmObjects = {};
        for (let i = 0; i < allSwarmEntries.length; i++) {
            let obj = allObjects[allSwarmEntries[i]];
            if (!obj) {
                this._primaryMemory.RemoveData(allSwarmEntries[i]);
                continue;
            }
            let swarmMem = this._primaryMemory.CheckoutMemory(allSwarmEntries[i]);
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