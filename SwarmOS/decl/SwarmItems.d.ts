declare interface ISwarmItem<T> {
    Value: T;
}
declare type SwarmObject<T extends Source |
    Creep | Mineral | Resource | Structure |
    ConstructionSite | Nuke |
    Tombstone> = ISwarmItem<T> &
    {
        pos: RoomPosition;
        room: ISwarmItem<Room>;
        id: string;
    }

declare type SwarmTombstone = SwarmObject<Tombstone> & {
    creep: SwarmObject<Creep>;
    deathTime: number;
    store: StoreDefinition;
    ticksToDecay: number;
}

declare type NotifiableSwarmObject<T extends Creep | Structure> = SwarmObject<T> & {
    NotifyWhenAttacked(enabled: boolean): number;
}

declare type OwnableSwarmObject<T extends Creep | OwnedStructure> = NotifiableSwarmObject<T> & {
    my: boolean;
    owner: string;
}

declare type SwarmCreep = OwnableSwarmObject<Creep>;
declare type SwarmRoom = ISwarmItem<Room>;
declare type SwarmStructure = NotifiableSwarmObject<Structure>;
declare type SwarmFlag = ISwarmItem<Flag>

declare type PrimarySwarmTypes = SwarmRoom | SwarmCreep | SwarmStructure | SwarmFlag;