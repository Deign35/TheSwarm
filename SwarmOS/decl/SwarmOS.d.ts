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
declare var CC: any;
declare var GR: any;

declare interface IOverseerRequirements_Creep {
    time: number,
    creepBody: { min: BodyPartConstant[], mid: BodyPartConstant[], best: BodyPartConstant[] }
}
declare interface IOverseerData_Resource {
    location: RoomPosition | RoomObject,
    amount: number,
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
    HasRequirements(): boolean;
    GetAvailableResources(): IOverseerData_Resource[];
    GetRequirements(): IOverseerRequirements;
    AssignCreep(creep: Creep): void;
    ValidateOverseer(): void;
    ActivateOverseer(): void;
    ReleaseCreep(name: string, releaseReason: string): void;
}