import { BasicProcess } from "Core/BasicTypes";

export const bundle: IPackage<SpawnerExtension_Memory> = {
    install(processRegistry: IProcessRegistry, extensionRegistry: IExtensionRegistry) {
        processRegistry.register(PKG_BasicOwnedRoom, BasicOwnedRoom);
    },
    rootImageName: PKG_BasicOwnedRoom
}

import { RoomBase } from "Rooms/RoomBase";

class BasicOwnedRoom extends RoomBase<BasicOwnedRoom_Memory> {
    protected activateRoom(roomData: RVD_RoomMemory, room?: Room): void {
        if (!room) {
            this.log.fatal(`Owned room not found (${this.memory.roomName})`);
            this.kernel.killProcess(this.pid);
            return;
        }
        if (roomData.cSites.length > 0) {
            this.SpawnClass(this.memory.creeps.bui, 1, PKG_CreepBuilder);
        }

        if (roomData.owner && roomData.owner == MY_USERNAME) {
            if (!this.memory.creeps.ref) {
                this.memory.creeps.ref = [];
            }
            this.SpawnClass(this.memory.creeps.ref, 1, PKG_CreepRefiller);

            if (!this.memory.creeps.upg) {
                this.memory.creeps.upg = [];
            }
            this.SpawnClass(this.memory.creeps.upg, 2, PKG_CreepUpgrader);

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

            /*if (!this.memory.creeps.harv) {
                this.memory.creeps.harv = [];
            }
            this.SpawnClass(this.memory.creeps.harv, roomData.sourceIDs.length, PKG_CreepHarvester);*/

            if (!this.memory.creeps.misc) {
                this.memory.creeps.misc = [];
            }
        }
    }

    SpawnClass(creepArr: PID[], numToHave: number, pkgType: string) {
        for (let i = 0; i < creepArr.length; i++) {
            let proc = this.kernel.getProcessById(creepArr[i]); {
                if (!proc) {
                    creepArr.splice(i--, 1);
                }
            }
        }
        if (creepArr.length < numToHave) {
            let newMemory: CreepProcess_Memory = {
                homeRoom: this.room!.name,
                targetRoom: this.room!.name,
                retrieving: true
            }
            let newPID = this.kernel.startProcess(pkgType, newMemory);
            if (!newPID || !newPID.pid || !newPID.process) {
                this.log.fatal(`Room failed to create a builder process (${this.room!.name})`);
                return;
            }
            creepArr.push(newPID.pid);
        }
    }
}