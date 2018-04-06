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