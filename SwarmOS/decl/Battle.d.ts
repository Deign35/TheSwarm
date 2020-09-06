declare interface BattleSquad_Memory extends MemBase {
  expires?: boolean;
  homeRoom: RoomID;
  targetRoom: RoomID;
  squad: {
    activityPID?: PID;
    creepID?: CreepID;
  }[];
}

declare interface RemoteProtector_Memory extends BattleSquad_Memory {

}