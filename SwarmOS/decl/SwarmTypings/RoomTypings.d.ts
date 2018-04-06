declare type TRoomData = IRoomData<RoomType>;
declare interface IRoomData<T extends RoomType> extends ISwarmData<SwarmDataType.Room, SwarmType.SwarmRoom, T> {
}