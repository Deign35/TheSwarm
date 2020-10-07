declare interface RoomMemory extends MemBase {
  homeRoom: RoomID;
}

declare interface Tower_Memory extends RoomMemory { }
declare interface WallWatcher_Memory extends RoomMemory { }
declare interface WallWatcher_Cache extends MemCache {
  wallCount: number;
  rampartCount: number;
}

declare interface HomeRoomManager_Memory extends RoomMemory {
  harvesterPIDs: IDictionary<ObjectID, PID>;
  largeHarvester: PID;
  refillerPIDs: PID[];
  workerPIDs: PID[];
  mineralCollectorPID: PID;
  mineralHarvesterPID: PID;
  upgraderPID: PID;
}

declare interface HomeRoomManager_Cache extends MemCache {
  primaryLink?: ObjectID;
}

declare interface RemoteManager_Memory extends RoomMemory {
  targetRoom: RoomID;
  harvesterPIDs: IDictionary<ObjectID, PID>;
  refillerPIDs: PID[];
  workerPID?: PID;
  claimerPID?: PID;
  invasion?: number;
  remoteProtector?: PID;
}

declare interface LabManager_Memory extends RoomMemory {
  scientistPID: PID;
}

declare interface RoomController_Memory extends RoomMemory {
  activityPIDs: {
    [RPKG_HomeRoomManager]?: PID;
    [RPKG_LabManager]?: PID;
    [RPKG_RemoteManager]?: PID;
    [RPKG_Towers]?: PID;
    [RPKG_WallWatcher]?: PID;
  }
}
declare interface RoomController_Cache extends MemCache {

}

declare interface RoomPlanner_Memory extends RoomMemory {
  anchorPosX: number;
  anchorPosY: number;
  canBunker: boolean;
}