import { profile } from "Tools/Profiler";
import { MemoryNotFoundException } from "Tools/SwarmExceptions";
import { BasicMemory } from "Memory/StorageMemory";
import { SwarmCreator } from "SwarmTypes/SwarmCreator";

const SWARMOBJECT_IDs = 'IDs';
@profile
export abstract class SwarmManager<T extends SwarmType, U extends Room | RoomObject, V extends SwarmDataType>
    implements IMasterSwarmController<T, U, V> {
    constructor() { this.LoadSwarmObjects(); }
    get StorageType() { return this.getStorageType(); }

    protected get SwarmObjects() { return this.swarmObjects; }
    private swarmObjects!: { [itemID: string]: ISwarmObj<T, U, V> };
    private _primaryMemory!: TMasterMemoryTypes;

    PrepareTheSwarm(): void {
        for (const swarmName in this.swarmObjects) {
            this.OnPrepareSwarm(this.swarmObjects[swarmName])
        }
    }
    ActivateSwarm(): void {
        for (let swarmName in this.swarmObjects) {
            this.OnActivateSwarm(this.swarmObjects[swarmName]);
            this.swarmObjects[swarmName];
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
    GetSwarmObject(id: string) {
        return this.swarmObjects[id];
    }

    private LoadSwarmObjects() {
        let allObjects = this.FindAllGameObjects();
        this._primaryMemory = Swarmlord.ReserveMem(Swarmlord.StorageMemoryTypeToString(this.StorageType), this.StorageType) as TMasterMemoryTypes;

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
            swarmObj.AssignMemory(Swarmlord.ReserveMem(swarmObj.saveID, this.StorageType, this._primaryMemory));
            swarmObjects[allSwarmEntries[i]] = swarmObj;
        }

        // Anything left in this object is new and needs to be added
        for (let objID in allObjects) {
            let swarmObj = this.CreateSwarmObject(allObjects[objID]);
            Swarmlord.CreateNewSwarmMemory(objID, SwarmDataType.RoomObject, this._primaryMemory);
            swarmObj.AssignMemory(Swarmlord.ReserveMem(objID, this.StorageType, this._primaryMemory));
            swarmObj.InitNewObject();
            swarmObjects[objID] = swarmObj;
        }

        this.swarmObjects = swarmObjects;
    }

    protected CreateSwarmObject(obj: any) {
        return SwarmCreator.CreateSwarmObject(obj);
    }
    protected abstract getManagerSavePath(): string[];
    //protected abstract getSwarmType(obj: U): T;
    protected abstract getStorageType(): V;
    protected abstract FindAllGameObjects(): IDictionary<U>
    protected abstract OnPrepareSwarm(swarmObj: ISwarmObj<T, U, V>): void;
    protected abstract OnActivateSwarm(swarmObj: ISwarmObj<T, U, V>): void;
    protected abstract OnFinalizeSwarm(swarmObj: ISwarmObj<T, U, V>): void;
}