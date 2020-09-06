export const OSPackage: IPackage = {
  install(processRegistry: IProcessRegistry, extensionRegistry: IExtensionRegistry) {
    processRegistry.register(RPKG_LabManager, LabManager);
  }
}
import { BasicProcess } from "Core/BasicTypes";

class LabManager extends BasicProcess<LabManager_Memory> {
  @extensionInterface(EXT_RoomManager)
  protected roomManager!: IRoomManagerExtension;
  RunThread(): ThreadState {
    const roomData = this.roomManager.GetRoomData(this.memory.homeRoom)!;
    if (roomData.labOrders.length > 0 && roomData.structures[STRUCTURE_TERMINAL].length > 0) {
      if (!this.memory.scientistPID || !this.kernel.getProcessByPID(this.memory.scientistPID)) {
        this.memory.scientistPID = this.kernel.startProcess(CPKG_Scientist, {
          expires: true,
          homeRoom: this.memory.homeRoom,
          targetRoom: this.memory.scientistPID
        } as Scientist_Memory);
        this.kernel.setParent(this.memory.scientistPID, this.pid);
      }
    }

    for (let i = 0; i < roomData.labOrders.length; i++) {
      const lab1 = Game.getObjectById<StructureLab>(roomData.labOrders[i].input_1.lab_id);
      if (!lab1) { continue; }
      const lab2 = Game.getObjectById<StructureLab>(roomData.labOrders[i].input_2.lab_id);
      if (!lab2) { continue; }
      const lab3 = Game.getObjectById<StructureLab>(roomData.labOrders[i].output_id);
      if (!lab3) { continue; }

      if (lab3.cooldown == 0) {
        lab3.runReaction(lab1, lab2);
      }

    }
    return ThreadState_Done;
  }
}