declare interface BattleSquad_Memory extends MemBase {
  expires?: boolean;
  homeRoom: RoomID;
  targetRoom: RoomID;
  squad: {
    activityPID?: PID;
    creepID?: CreepID;
    hasRun: boolean;
  }[];
}

declare interface RemoteProtector_Memory extends BattleSquad_Memory {

}
declare interface RoomAttacker_Memory extends BattleSquad_Memory {

}

declare interface RoomAttacker_Cache extends MemCache {
  attackerAttacked: boolean;
}

//CLI(CLI_Launch, BPKG_RoomAttacker, { expires: true, homeRoom: "E15S41", targetRoom: "E15S42", squad: [{}, {}]});