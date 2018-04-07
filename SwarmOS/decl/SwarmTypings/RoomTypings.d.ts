declare type TRoomData = IRoomData<RoomType>;
declare interface IRoomData<T extends RoomType> extends ISwarmData<SwarmDataType.Room, SwarmType.SwarmRoom, T> {
}
declare interface AIRoomBase<T extends RoomType> extends AIBase<IRoomData<T>, Room> {

}

declare type AIRoom = AIRoomBase<RoomType>;