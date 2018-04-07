declare type TRoomObjectData = IMineralData | ISourceData | INukeData |
    IResourceData | ITombstoneData | ISiteData;

declare interface IRoomObjectData<T extends SwarmRoomObjectType>
    extends ISwarmData<SwarmDataType.RoomObject, T, T> {
    // Special info for RoomObjects.
}
declare interface ISourceData extends IRoomObjectData<SwarmType.SwarmSource> {
    creepID: string | undefined;
    containerID: string | undefined;
    linkID: string | undefined;
    pileID: string | undefined;
    constructionID: string | undefined;
}
declare interface IMineralData extends IRoomObjectData<SwarmType.SwarmMineral> {
    creepID: string | undefined;
    containerID: string | undefined;
    pileID: string | undefined;
}
declare interface INukeData extends IRoomObjectData<SwarmType.SwarmNuke> { }
declare interface IResourceData extends IRoomObjectData<SwarmType.SwarmResource> { }
declare interface ITombstoneData extends IRoomObjectData<SwarmType.SwarmTombstone> { }
declare interface ISiteData extends IRoomObjectData<SwarmType.SwarmSite> { }


declare interface AIRoomObjectBase<T extends TRoomObjectData, U extends _rmType> extends AIBase<T, U> {

}
declare interface AIMineral extends AIRoomObjectBase<IMineralData, Mineral> {

}
declare interface AINuke extends AIRoomObjectBase<INukeData, Nuke> {

}
declare interface AIResource extends AIRoomObjectBase<IResourceData, Resource> {

}
declare interface AISource extends AIRoomObjectBase<ISourceData, Source> {

}
declare interface AISite extends AIRoomObjectBase<ISiteData, ConstructionSite> {

}
declare interface AITombstone extends AIRoomObjectBase<ITombstoneData, Tombstone> {

}

declare type AIRoomObject = AIMineral | AINuke | AIResource | AISource | AISite | AITombstone;