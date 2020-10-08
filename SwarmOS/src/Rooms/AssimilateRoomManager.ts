export const OSPackage: IPackage = {
  install(processRegistry: IProcessRegistry, extensionRegistry: IExtensionRegistry) {
    processRegistry.register(RPKG_AssimilateRoomManager, AssimilateRoomManager);
  }
}
import { BasicProcess } from "Core/BasicTypes";

const RPKG_AssimilateRoomManager_LogContext: LogContext = {
  logID: RPKG_AssimilateRoomManager,
  logLevel: LOG_TRACE
}

class AssimilateRoomManager extends BasicProcess<AssimilateRoomManager_Memory, MemCache> {
  @extensionInterface(EXT_RoomManager)
  protected roomManager!: IRoomManagerExtension;
  protected get logID(): string {
    return RPKG_AssimilateRoomManager_LogContext.logID;
  }
  protected get logLevel(): LogLevel {
    return RPKG_AssimilateRoomManager_LogContext.logLevel;
  }

  RunThread(): ThreadState {
    const roomData = this.roomManager.GetRoomData(this.memory.homeRoom)!;
    if (!Game.rooms[this.memory.homeRoom] || !Game.rooms[this.memory.homeRoom].controller || !Game.rooms[this.memory.homeRoom].controller!.my) {
      if (!this.memory.claimerPID || !this.kernel.getProcessByPID(this.memory.claimerPID)) {
        if (this.memory.numClaimers == 3) {
          roomData.roomType = RT_Nuetral;
          return ThreadState_Done;
        } else {
          this.memory.claimerPID = this.kernel.startProcess(CPKG_ControllerClaimer, {
            homeRoom: roomData.homeRoom,
            targetRoom: this.memory.homeRoom,
          } as ControllerClaimer_Memory);
          this.kernel.setParent(this.memory.claimerPID, this.pid);
        }
      }
    } else {
      for (let i = 0; i < this.memory.booterPIDs.length; i++) {
        if (!this.kernel.getProcessByPID(this.memory.booterPIDs[i])) {
          this.memory.booterPIDs.splice(i--, 1);
        }
      }

      while (this.memory.booterPIDs.length < 3) {
        this.memory.booterPIDs.push(this.kernel.startProcess(CPKG_RoomBooter, {
          homeRoom: roomData.homeRoom,
          targetRoom: this.memory.homeRoom,
        } as RoomBooter_Memory));
        // Don't make parented so they keep working after finishing the spawn.
      }

      const spawns = Game.rooms[this.memory.homeRoom].find(FIND_MY_SPAWNS);
      if (spawns.length > 0) {
        roomData.roomType = RT_Home;
      }
    }

    return ThreadState_Done;
  }
}