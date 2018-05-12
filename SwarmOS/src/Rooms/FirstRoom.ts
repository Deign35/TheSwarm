/*import { ProcessBase } from "Core/BasicTypes";

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

        let sites = this.GetRoomView()!.cSites;
        if (sites.length > 0) {
            for (let i = 0; i < this.memory.builders.length; i++) {
                let builderPID = this.memory.builders[i];
                let builderProcess = builderPID ? this.kernel.getProcessById(builderPID) : undefined;

                if (!builderProcess) {
                    this.memory.builders.splice(i--, 1);
                }
            }
            if (this.memory.builders.length < 3) {
                let builderContext: Builder_memory = {
                    homeRoom: room.name,
                    targetRoom: room.name,
                    retrieving: true
                }
                let newPID = this.kernel.startProcess(PKG_CreepBuilder, builderContext);
                if (!newPID || !newPID.pid || !newPID.process) {
                    this.log.fatal(`Room failed to create a builder process (${room.name})`);
                    this.kernel.killProcess(this.pid);
                    return;
                }
                this.memory.builders.push(newPID.pid);
            }
        }
        let refillerPID = this.memory.refiller;
        let refillerProcess = refillerPID ? this.kernel.getProcessById(refillerPID) : undefined;

        if (!refillerProcess) {
            let refillerContext: SpawnRefiller_Memory = {
                homeRoom: room.name,
                targetRoom: room.name,
                retrieving: true
            }
            let newPID = this.kernel.startProcess(PKG_CreepRefiller, refillerContext);
            if (!newPID || !newPID.pid || !newPID.process) {
                this.log.fatal(`Room failed to create a refiller process (${room.name})`);
                this.kernel.killProcess(this.pid);
                return;
            }
            this.memory.refiller = newPID.pid;
        }

        for (let i = 0; i < this.memory.upgraders.length; i++) {
            let upgraderProcess;
            let upgraderPID = this.memory.upgraders[i];
            if (upgraderPID) {
                upgraderProcess = this.kernel.getProcessById(upgraderPID);
                if (!upgraderProcess) {
                    this.memory.upgraders.splice(i--, 1);
                }
            }
        }

        if (Object.keys(this.memory.upgraders).length < 2) {
            let upgraderContext: Upgrader_Memory = {
                homeRoom: room.name,
                targetRoom: room.name,
                retrieving: true
            }
            let newPID = this.kernel.startProcess(PKG_CreepUpgrader, upgraderContext);
            if (!newPID || !newPID.pid || !newPID.process) {
                this.log.fatal(`Room failed to create an upgrader process (${room.name})`);
                this.kernel.killProcess(this.pid);
                return;
            }
            this.memory.upgraders.push(newPID.pid)
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
                    targetRoom: room.name,
                    homeRoom: room.name,
                    retrieving: false
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
}*/