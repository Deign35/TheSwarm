
/** Room Memory */
declare interface RoomProcess_Memory extends MemBase {
    roomName: string;
    groups: IDictionary<RoomID, PID>;
}