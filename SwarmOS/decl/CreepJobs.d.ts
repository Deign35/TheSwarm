/** Creep Job Memory */
declare interface CreepJob_Memory extends MemBase {
  room: RoomID;
  creepID?: CreepID;
}

declare interface HarvesterJob_Memory extends CreepJob_Memory {

}