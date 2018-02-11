declare const require: (module: string) => any;
declare type IDictionary<T> = { [id: string]: T };
declare type Dictionary = IDictionary<any>
declare var global: Dictionary;

declare type CallbackFunction = (...args: any[]) => any;
declare interface IDelegate<T extends CallbackFunction> {
    Subscribe(id: string, callback: T): void;
    Unsubscribe(id: string): void;
    Notify(...args: any[]): void;
}
declare interface IMemory {
    readonly MemoryID: string;
    GetData(id: string): any;
    SetData(id: string, data: any): void;
    Save(): void;
    Load(): void;
}

declare interface IOverseerRequirements_Creep {
    time: number,
    creepBody: BodyPartConstant[]
}
declare interface IOverseerData_Resource {
    location: RoomPosition | RoomObject,
    amount: number,
    type: ResourceConstant
}
declare interface IOverseerRequirements {
    Creeps: IOverseerRequirements_Creep[],
    Resources: IOverseerData_Resource[],
}

declare interface IOverseerAvailable {
    Resources: IOverseerData_Resource[],
}

declare interface IOverseer_Registry {
    Available: IOverseerAvailable,
    Requirements: IOverseerRequirements
}

declare interface IOverseer extends IMemory {
    HasResources(): boolean;
    GetAvailableResources(): IOverseerData_Resource[];
    GetRequirements(): IOverseerRequirements;
    AssignCreep(creepName: string): void;
    ActivateOverseer(): void;
    ReleaseCreep(name: string, releaseReason: string): void;
    AssignOrder(orderID: string): boolean;
}

declare interface DistributionOrder {
    amount: number
    resourceType: ResourceConstant,
    toTarget: string,
    distributionStatus: string,
}