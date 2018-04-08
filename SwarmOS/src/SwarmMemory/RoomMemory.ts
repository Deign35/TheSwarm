import { SwarmMemoryWithSpecifiedData } from "SwarmMemory/SwarmMemory";

abstract class RoomMemoryBase<T extends RoomType, U extends IRoomData<T>>
    extends SwarmMemoryWithSpecifiedData<U> implements IRoomData<T>{
    get MEM_TYPE(): SwarmDataType.Room { return SwarmDataType.Room; }
    get SWARM_TYPE(): SwarmType.SwarmRoom { return SwarmType.SwarmRoom; } //{ return this.cache.SWARM_TYPE; }
    get SUB_TYPE(): T { return this.cache.SUB_TYPE; }
}
abstract class RoomMemoryWithSpecifiedData<T extends TRoomData>
    extends RoomMemoryBase<RoomType, T> implements TRoomData {
}

export class RoomMemory extends RoomMemoryWithSpecifiedData<TRoomData>
    implements TRoomData {
}

//declare type RoomMemory = ConsulMemoryWithSpecifiedData<TRoomData>;