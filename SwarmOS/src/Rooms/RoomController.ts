export const OSPackage: IPackage = {
  install(processRegistry: IProcessRegistry, extensionRegistry: IExtensionRegistry) {
    processRegistry.register(RPKG_RoomController, RoomController);
  }
}

import { BasicProcess } from "Core/BasicTypes";

const AllRoomPackages = [RPKG_EnergyManager, RPKG_LabManager, RPKG_RemoteManager, RPKG_Towers];

const RoomTypeToPackage: { [id: string]: string[] } = {
  [RT_Home]: [RPKG_EnergyManager, RPKG_Towers, RPKG_LabManager],
  [RT_RemoteHarvest]: [RPKG_RemoteManager],
  [RT_Center]: [],
  [RT_Highway]: [],
  [RT_Nuetral]: [],
  [RT_SourceKeeper]: []
};

class RoomController extends BasicProcess<RoomController_Memory, RoomController_Cache> {
  @extensionInterface(EXT_RoomManager)
  roomManager!: IRoomManagerExtension;

  RunThread(): ThreadState {
    const data = this.roomManager.GetRoomData(this.memory.homeRoom);
    if (!data) {
      this.kernel.killProcess(this.pid);
      return ThreadState_Done;
    }

    if (RoomTypeToPackage[data.roomType]) {
      for (let i = 0; i < AllRoomPackages.length; i++) {
        if (!RoomTypeToPackage[data.roomType].includes(AllRoomPackages[i]) && this.memory.activityPIDs[AllRoomPackages[i]]) {
          this.kernel.killProcess(this.memory.activityPIDs[AllRoomPackages[i]]);
          delete this.memory.activityPIDs[AllRoomPackages[i]];
        }
      }
    }

    if (data.roomType == RT_Home) {
      if (!this.memory.activityPIDs[RPKG_Towers] || !this.kernel.getProcessByPID(this.memory.activityPIDs[RPKG_Towers]!)) {
        this.memory.activityPIDs[RPKG_Towers] = this.kernel.startProcess(RPKG_Towers, {
          homeRoom: this.memory.homeRoom
        } as Tower_Memory);
        this.kernel.setParent(this.memory.activityPIDs[RPKG_Towers]!, this.pid);
      }

      if (!this.memory.activityPIDs[RPKG_LabManager] || !this.kernel.getProcessByPID(this.memory.activityPIDs[RPKG_LabManager]!)) {
        this.memory.activityPIDs[RPKG_LabManager] = this.kernel.startProcess(RPKG_LabManager, {
          homeRoom: this.memory.homeRoom,
        } as LabManager_Memory);
      }

      if (!this.memory.activityPIDs[RPKG_EnergyManager] || !this.kernel.getProcessByPID(this.memory.activityPIDs[RPKG_EnergyManager]!)) {
        this.memory.activityPIDs[RPKG_EnergyManager] = this.kernel.startProcess(RPKG_EnergyManager, {
          harvesterPIDs: {},
          refillerPID: '',
          workerPIDs: [],
          mineralHarvesterPID: '',
          homeRoom: this.memory.homeRoom,
          numWorkers: (data.sourceIDs.length * 2)
        } as EnergyManager_Memory);
        this.kernel.setParent(this.memory.activityPIDs[RPKG_EnergyManager]!, this.pid);
      }
    } else if (data.roomType == RT_RemoteHarvest) {
      if (!this.memory.activityPIDs[RPKG_RemoteManager] || !this.kernel.getProcessByPID(this.memory.activityPIDs[RPKG_RemoteManager]!)) {
        this.memory.activityPIDs[RPKG_RemoteManager] = this.kernel.startProcess(RPKG_RemoteManager, {
          harvesterPIDs: {},
          numRefillers: 3,
          refillerPIDs: [],
          targetRoom: this.memory.homeRoom,
          homeRoom: data.homeRoom,
        } as RemoteManager_Memory);
        this.kernel.setParent(this.memory.activityPIDs[RPKG_RemoteManager]!, this.pid);
      }
    }

    this.sleeper.sleep(this.pid, 31);
    return ThreadState_Done;
  }
}