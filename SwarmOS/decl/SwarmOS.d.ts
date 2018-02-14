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
    readonly id: string;
    Save(): void;
    Load(): void;
    GetData(id: string): any;
    SetData(id: string, data: any): void;
    RemoveData(id: string): any;
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

declare interface Hive_CreepData { // CreepName is id
    Assignment: string,
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
    ValidateOverseer(): void;
}

declare interface DistributionOrder {
    amount: number
    resourceType: ResourceConstant,
    toTarget: string,
    distributionStatus: string,
}

declare interface BuildOrder {
    siteID?: string,
    pos?: { x: number, y: number, roomName: string }
    assignedBuilders: number,
    numBuilders: number
}

declare interface RoomMap {
    Tiles: { [name: string]: RoomTile };
}

declare interface RoomTile {
    PrimaryObject: RoomObject; // Source, road, container,
    xPos: number,
    yPos: number,
}

declare interface IDisposable {
    dispose(): void;
}
declare type DisposableCallback<T extends IDisposable> = (disposableObject: T) => void;
declare function using<T extends IDisposable>(disposableObject: T, disposableAction: DisposableCallback<T>): void;