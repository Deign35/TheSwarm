import { ProcessBase } from "Core/BasicTypes";

export const bundle: IPosisBundle<SpawnData_Memory> = {
    install(processRegistry: IPosisProcessRegistry, extensionRegistry: IPosisExtensionRegistry) {
        processRegistry.register(PKG_FirstRoom, FirstRoom);
    },
    rootImageName: PKG_FirstRoom
}

import { RoomBase } from "Rooms/RoomBase";

class FirstRoom extends RoomBase<FirstRoom_Memory> {
    protected activateRoom(roomData: RoomData_Memory, room?: Room): void {
        if (!room) {
            this.log.fatal(`First room not found (${this.memory.roomName})`);
            this.kernel.killProcess(this.pid);
            return;
        }
        for (let i = 0; i < roomData.sourceIDs.length; i++) {
            let sourceID = roomData.sourceIDs[i];

            let sourceProcess;
            let sourcePID = this.memory.sources[sourceID];
            if (sourcePID) {
                sourceProcess = this.kernel.getProcessById(sourcePID);
            }
            if (!sourceProcess) {
                let sourceContext: Harvester_Memory = {
                    targetID: sourceID,
                }
                let newPID = this.kernel.startProcess(PKG_CreepHarvester, sourceContext);
                if (!newPID || !newPID.pid || !newPID.process) {
                    this.log.fatal(`Room failed to create a harvester process (${room.name})`);
                    this.kernel.killProcess(this.pid);
                    return;
                }
                this.memory.sources[sourceID] = newPID.pid;
            }
        }
    }
}