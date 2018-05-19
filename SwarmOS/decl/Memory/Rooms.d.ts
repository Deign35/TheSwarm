
/** Room Memory */
declare interface RoomProcess_Memory extends ThreadMemory_Parent {
    roomName: string;
    groups: { [id in CreepGroupPackage]?: PID }// IDictionary<CreepGroupPackage, PID>
}

declare interface LowLevelRoom_Memory extends RoomProcess_Memory {

}

declare interface SupportHarvestRoom_Memory extends RoomProcess_Memory {

}