/** Room Memory */

declare interface BasicRoom_Memory extends MemBase {
    homeRoom: RoomID;
    targetRoom: RoomID;
}

declare interface Tower_Memory extends MemBase {
    rID: RoomID;
}